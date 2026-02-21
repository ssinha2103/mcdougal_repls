// Robots.txt compliance checker
export async function checkRobotsTxt(url: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'SEOAnalyzerBot/1.0' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      // No robots.txt or error accessing it - allow by default
      return { allowed: true };
    }

    const robotsTxt = await response.text();
    const rules = parseRobotsTxt(robotsTxt);
    
    // Find most specific user-agent match (prefer specific over wildcard)
    const userAgents = ['seoanalyzerbot', 'bot', '*']; // Check specific first, wildcard last
    let applicableRules: { disallow: string[]; allow: string[] } | null = null;
    
    for (const ua of userAgents) {
      if (rules[ua]) {
        applicableRules = rules[ua];
        break;
      }
    }
    
    if (!applicableRules) {
      return { allowed: true };
    }
    
    // Apply longest-match precedence between Allow and Disallow
    const pathname = urlObj.pathname;
    let longestMatch = '';
    let isAllowed = true; // Default to allowed
    
    // Check all disallow rules
    for (const pattern of applicableRules.disallow) {
      if (pathname.startsWith(pattern) && pattern.length > longestMatch.length) {
        longestMatch = pattern;
        isAllowed = false;
      }
    }
    
    // Check all allow rules (can override disallow if equal or longer match)
    for (const pattern of applicableRules.allow) {
      if (pathname.startsWith(pattern) && pattern.length >= longestMatch.length) {
        longestMatch = pattern;
        isAllowed = true;
      }
    }
    
    if (!isAllowed) {
      return {
        allowed: false,
        reason: `Access disallowed by robots.txt (matched pattern: ${longestMatch})`
      };
    }

    return { allowed: true };
  } catch (error) {
    // On error, allow by default (fail open)
    console.warn('[RobotsChecker] Error checking robots.txt:', error);
    return { allowed: true };
  }
}

function parseRobotsTxt(content: string): Record<string, { disallow: string[]; allow: string[] }> {
  const rules: Record<string, { disallow: string[]; allow: string[] }> = {};
  let currentUserAgent: string | null = null;

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('user-agent:')) {
      currentUserAgent = trimmed.split(':')[1].trim();
      if (!rules[currentUserAgent]) {
        rules[currentUserAgent] = { disallow: [], allow: [] };
      }
    } else if (currentUserAgent) {
      if (trimmed.startsWith('disallow:')) {
        const path = trimmed.split(':')[1].trim();
        if (path) rules[currentUserAgent].disallow.push(path);
      } else if (trimmed.startsWith('allow:')) {
        const path = trimmed.split(':')[1].trim();
        if (path) rules[currentUserAgent].allow.push(path);
      }
    }
  }

  return rules;
}
