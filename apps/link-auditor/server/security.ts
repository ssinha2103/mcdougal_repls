import { URL } from "url";
import { lookup as dnsLookup } from "dns/promises";
import { isIP } from "net";
import type { LookupFunction } from "net";

/**
 * Security utility to prevent SSRF (Server-Side Request Forgery) attacks
 * by resolving DNS and validating IP addresses before making outbound requests.
 */

// Blocked cloud metadata endpoints
const BLOCKED_METADATA_HOSTS = [
  "metadata.google.internal",
  "169.254.169.254",
  "metadata.goog",
  "metadata",
  // AWS
  "169.254.169.254",
  // Azure
  "169.254.169.254",
  // Alibaba Cloud
  "100.100.100.200",
];

/**
 * Checks if an IPv4 address is in a private or special-use range
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const [a, b, c, d] = parts;

  // Loopback: 127.0.0.0/8
  if (a === 127) return true;

  // Private networks (RFC 1918)
  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;

  // Link-local: 169.254.0.0/16
  if (a === 169 && b === 254) return true;

  // Carrier-grade NAT: 100.64.0.0/10
  if (a === 100 && b >= 64 && b <= 127) return true;

  // Special use / Documentation ranges
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 192 && b === 0 && c === 0) return true; // 192.0.0.0/24
  if (a === 192 && b === 0 && c === 2) return true; // 192.0.2.0/24 (TEST-NET-1)
  if (a === 198 && b === 51 && c === 100) return true; // 198.51.100.0/24 (TEST-NET-2)
  if (a === 203 && b === 0 && c === 113) return true; // 203.0.113.0/24 (TEST-NET-3)
  if (a === 192 && b === 88 && c === 99) return true; // 192.88.99.0/24 (6to4 Relay Anycast)
  if (a === 198 && b >= 18 && b <= 19) return true; // 198.18.0.0/15 (Benchmark Testing)

  // Multicast: 224.0.0.0/4
  if (a >= 224 && a <= 239) return true;

  // Reserved: 240.0.0.0/4
  if (a >= 240) return true;

  // Broadcast
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a private or special-use range
 */
function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();

  // Loopback: ::1
  if (lower === "::1") return true;

  // Link-local: fe80::/10 (fe80 - febf)
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || 
      lower.startsWith("fea") || lower.startsWith("feb")) return true;

  // Unique local addresses (ULA): fc00::/7
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;

  // Multicast: ff00::/8
  if (lower.startsWith("ff")) return true;

  // IPv4-mapped IPv6: ::ffff:0:0/96
  if (lower.includes("::ffff:")) return true;

  // Documentation: 2001:db8::/32
  if (lower.startsWith("2001:db8:") || lower.startsWith("2001:0db8:")) return true;

  return false;
}

/**
 * Checks if an IP address (v4 or v6) is private or blocked
 */
function isPrivateIP(ip: string): boolean {
  const ipVersion = isIP(ip);
  if (ipVersion === 4) {
    return isPrivateIPv4(ip);
  } else if (ipVersion === 6) {
    return isPrivateIPv6(ip);
  }
  return false;
}

/**
 * Validates a URL to prevent SSRF attacks by resolving DNS and checking IPs
 * @param urlString - The URL to validate
 * @returns A promise that resolves to an object with isValid boolean and optional error message
 */
export async function validateUrl(urlString: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTP and HTTPS protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        isValid: false,
        error: `Invalid protocol: ${url.protocol}. Only HTTP and HTTPS are allowed.`,
      };
    }
    
    const hostname = url.hostname.toLowerCase();
    
    // Check against blocked metadata hosts
    if (BLOCKED_METADATA_HOSTS.includes(hostname)) {
      return {
        isValid: false,
        error: "Access to cloud metadata endpoints is not allowed.",
      };
    }
    
    // Additional checks for metadata endpoint patterns
    if (hostname.includes("metadata") && 
        (hostname.endsWith(".internal") || hostname.endsWith(".goog"))) {
      return {
        isValid: false,
        error: "Access to cloud metadata endpoints is not allowed.",
      };
    }
    
    // If hostname is already an IP address, check it directly
    if (isIP(hostname)) {
      if (isPrivateIP(hostname)) {
        return {
          isValid: false,
          error: "Access to private, local, or internal IP addresses is not allowed.",
        };
      }
      return { isValid: true };
    }
    
    // Resolve hostname to IP addresses
    try {
      const addresses = await dnsLookup(hostname, { all: true });
      
      // Check all resolved IP addresses
      for (const addr of addresses) {
        if (isPrivateIP(addr.address)) {
          return {
            isValid: false,
            error: `Hostname resolves to private IP address (${addr.address}). Access to private networks is not allowed.`,
          };
        }
      }
      
      return { isValid: true };
    } catch (dnsError) {
      return {
        isValid: false,
        error: `DNS resolution failed: ${dnsError instanceof Error ? dnsError.message : "Unknown error"}`,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid URL format",
    };
  }
}

/**
 * Validates that a redirect target is safe
 * @param originalUrl - The original URL being checked
 * @param redirectUrl - The redirect target URL
 * @returns A promise that resolves to an object with isValid boolean and optional error message
 */
export async function validateRedirect(
  originalUrl: string,
  redirectUrl: string
): Promise<{ isValid: boolean; error?: string }> {
  try {
    // Resolve the redirect URL (could be relative)
    const resolvedUrl = new URL(redirectUrl, originalUrl).toString();
    
    // Validate the resolved redirect target
    return await validateUrl(resolvedUrl);
  } catch (error) {
    return {
      isValid: false,
      error: "Invalid redirect target",
    };
  }
}

/**
 * Creates a safe axios request configuration with DNS rebinding protection
 * @param urlString - The URL to make the request to
 * @returns A promise that resolves to axios config with custom lookup, or an error object
 */
export async function createSafeAxiosConfig(
  urlString: string
): Promise<{ config?: any; error?: string }> {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;
    
    // If hostname is already an IP, validate it directly
    if (isIP(hostname)) {
      if (isPrivateIP(hostname)) {
        return {
          error: "Access to private, local, or internal IP addresses is not allowed.",
        };
      }
      // For IP addresses, no custom lookup needed
      return { config: {} };
    }
    
    // Resolve and validate all IP addresses for this hostname
    const addresses = await dnsLookup(hostname, { all: true });
    const validAddresses: string[] = [];
    
    for (const addr of addresses) {
      if (isPrivateIP(addr.address)) {
        return {
          error: `Hostname resolves to private IP address (${addr.address}). Access to private networks is not allowed.`,
        };
      }
      validAddresses.push(addr.address);
    }
    
    if (validAddresses.length === 0) {
      return {
        error: "No valid IP addresses resolved for hostname",
      };
    }
    
    // Create a custom lookup function that only returns the validated IPs
    // This prevents DNS rebinding attacks
    let addressIndex = 0;
    const customLookup: LookupFunction = (hostname, options, callback) => {
      // Round-robin through validated addresses
      const address = validAddresses[addressIndex % validAddresses.length];
      addressIndex++;
      
      const family = isIP(address) === 4 ? 4 : 6;
      
      if (typeof callback === 'function') {
        callback(null, address, family);
      }
    };
    
    return {
      config: {
        lookup: customLookup,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create safe config",
    };
  }
}
