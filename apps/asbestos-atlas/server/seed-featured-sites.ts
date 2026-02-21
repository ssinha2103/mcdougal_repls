import { db } from './db';
import { featuredSites } from '@shared/schema';

// Base64 encoded SVG images for each site type
const createSiteImage = (siteName: string, color: string, siteType: string = "", description: string = "") => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'>
    <defs>
      <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style='stop-color:${color};stop-opacity:1' />
        <stop offset='100%' style='stop-color:${adjustColorBrightness(color, -20)};stop-opacity:1' />
      </linearGradient>
    </defs>
    <rect width='400' height='250' fill='url(#grad)'/>
    
    <!-- Industrial silhouettes -->
    <rect x='50' y='120' width='40' height='80' fill='rgba(255,255,255,0.15)' rx='2'/>
    <rect x='100' y='100' width='30' height='100' fill='rgba(255,255,255,0.2)' rx='2'/>
    <rect x='140' y='130' width='35' height='70' fill='rgba(255,255,255,0.15)' rx='2'/>
    <rect x='320' y='110' width='30' height='90' fill='rgba(255,255,255,0.15)' rx='2'/>
    <rect x='360' y='130' width='25' height='70' fill='rgba(255,255,255,0.1)' rx='2'/>
    
    <!-- Warning symbol -->
    <circle cx='50' cy='50' r='25' fill='rgba(255,255,255,0.9)'/>
    <text x='50' y='58' text-anchor='middle' fill='${color}' font-family='Arial, sans-serif' font-size='18' font-weight='bold'>⚠</text>
    
    <!-- Site type badge -->
    <rect x='280' y='20' width='110' height='25' fill='rgba(255,255,255,0.9)' rx='12'/>
    <text x='335' y='37' text-anchor='middle' fill='${color}' font-family='Arial, sans-serif' font-size='10' font-weight='bold'>
      ${siteType.toUpperCase()}
    </text>
    
    <!-- Main content -->
    <text x='200' y='140' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-size='18' font-weight='bold'>${siteName}</text>
    <text x='200' y='165' text-anchor='middle' fill='rgba(255,255,255,0.9)' font-family='Arial, sans-serif' font-size='12'>Asbestos Exposure Site</text>
    <text x='200' y='185' text-anchor='middle' fill='rgba(255,255,255,0.8)' font-family='Arial, sans-serif' font-size='11'>${description.split('\\n')[0]}</text>
    <text x='200' y='200' text-anchor='middle' fill='rgba(255,255,255,0.8)' font-family='Arial, sans-serif' font-size='11'>${description.split('\\n')[1] || ''}</text>
  </svg>`;
  return Buffer.from(svg).toString('base64');
};

function adjustColorBrightness(color: string, amount: number) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

const featuredSitesData = [
  {
    id: 1,
    name: "Paducah Gaseous Diffusion Plant",
    type: "Nuclear Facility",
    imageBase64: createSiteImage("Paducah, KY", "#ef4444", "Nuclear Facility", "AEC Plant - Uranium Enrichment\n1950s-1990s"),
    imageMimeType: "image/svg+xml",
    description: "AEC Plant (Union Carbide, Martin Marietta, Lockheed Martin) operated uranium enrichment facility with extensive asbestos use in construction and equipment from 1950s-1990s.",
    exposurePeriod: "1950s-1990s",
    siteType: "Nuclear/Government",
    status: "Under Cleanup"
  },
  {
    id: 2,
    name: "Ford Louisville Assembly Plant",
    type: "Manufacturing",
    imageBase64: createSiteImage("Louisville, KY", "#3b82f6", "Manufacturing", "Ford Assembly Plant\n1960s-1980s"),
    imageMimeType: "image/svg+xml",
    description: "Major automotive manufacturing facility where workers faced asbestos exposure from brake linings, gaskets, and building materials during peak production years.",
    exposurePeriod: "1960s-1980s",
    siteType: "Automotive",
    status: "Remediated"
  },
  {
    id: 3,
    name: "GE Appliance Park",
    type: "Industrial",
    imageBase64: createSiteImage("Louisville, KY", "#22c55e", "Industrial", "GE Manufacturing Complex\n1950s-1970s"),
    imageMimeType: "image/svg+xml",
    description: "Massive General Electric manufacturing complex producing appliances with significant asbestos use in electrical components, insulation, and building materials.",
    exposurePeriod: "1950s-1970s",
    siteType: "Manufacturing",
    status: "Remediated"
  },
  {
    id: 4,
    name: "TVA Shawnee Steam Plant",
    type: "Power Plant",
    imageBase64: createSiteImage("Paducah, KY", "#eab308", "Power Plant", "TVA Steam Plant\n1940s-1980s"),
    imageMimeType: "image/svg+xml",
    description: "Tennessee Valley Authority coal-fired power plant with extensive asbestos use in boilers, pipes, and electrical systems exposing maintenance and construction workers.",
    exposurePeriod: "1940s-1980s",
    siteType: "Power Generation",
    status: "Partially Remediated"
  },
  {
    id: 5,
    name: "Ashland Oil & Refinery",
    type: "Chemical",
    imageBase64: createSiteImage("Ashland, KY", "#f97316", "Chemical", "Oil Refinery\n1930s-1970s"),
    imageMimeType: "image/svg+xml",
    description: "Major petroleum refining facility where workers encountered asbestos in pipes, gaskets, and insulation throughout the refining process and maintenance operations.",
    exposurePeriod: "1930s-1970s",
    siteType: "Oil Refinery",
    status: "Remediated"
  },
  {
    id: 6,
    name: "Newport Steel Corporation",
    type: "Industrial",
    imageBase64: createSiteImage("Newport, KY", "#8b5cf6", "Industrial", "Steel Manufacturing\n1940s-1980s"),
    imageMimeType: "image/svg+xml",
    description: "Steel manufacturing and rolling mill operations exposed workers to asbestos from furnace linings, protective equipment, and building insulation materials.",
    exposurePeriod: "1940s-1980s",
    siteType: "Steel Manufacturing",
    status: "Site Cleaned"
  }
];

async function seedFeaturedSites() {
  try {
    console.log('Seeding featured sites...');
    
    // Clear existing data
    await db.delete(featuredSites);
    
    // Insert featured sites data
    await db.insert(featuredSites).values(featuredSitesData);
    
    console.log('Featured sites seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding featured sites:', error);
    process.exit(1);
  }
}

seedFeaturedSites();