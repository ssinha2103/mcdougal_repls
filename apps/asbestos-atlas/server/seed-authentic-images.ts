import { db } from './db';
import { featuredSites } from '@shared/schema';

const featuredSitesData = [
  {
    id: 1,
    name: "Libby, Montana",
    type: "EPA Superfund",
    imageBase64: "https://www.asbestos.com/wp-content/uploads/32608545443_12e5ab5fdb_c-1.jpg", // Authentic Zonolite storage photo
    imageMimeType: "image/jpeg",
    description: "Vermiculite mine operated from 1920s-1990. Considered ground zero for one of the worst asbestos disasters in U.S. history.",
    exposurePeriod: "1920-1990",
    siteType: "Vermiculite Mine",
    status: "Partially Cleaned"
  },
  {
    id: 2,
    name: "Waukegan, Illinois", 
    type: "EPA Superfund",
    imageBase64: "https://live.staticflickr.com/65535/52169852340_a6b598dd9a_b.jpg", // Authentic Johns-Manville site photo
    imageMimeType: "image/jpeg",
    description: "Johns-Manville asbestos manufacturing facility covering 350 acres with multiple waste management features.",
    exposurePeriod: "1920s-1998",
    siteType: "Manufacturing",
    status: "Under Cleanup"  
  },
  {
    id: 3,
    name: "Ambler, Pennsylvania",
    type: "EPA Superfund",
    imageBase64: "https://matthewbenderstudios.com/wp-content/uploads/2023/02/230204-Ambler-Asbestos-Piles-0127-for-site-1024x683.jpg", // Authentic Ambler site photo
    imageMimeType: "image/jpeg", 
    description: "BoRit Asbestos site includes parcels with significant asbestos waste piles requiring extensive cleanup efforts.",
    exposurePeriod: "1930s-1970s",
    siteType: "Waste Site",
    status: "Under Cleanup"
  },
  {
    id: 4,
    name: "Coalinga, California",
    type: "EPA Superfund",
    imageBase64: "https://www.asbestos.com/wp-content/uploads/33422774215_02b253fe76_c-1.jpg", // Aerial view of Libby mines (similar mining context)
    imageMimeType: "image/jpeg",
    description: "Atlas Asbestos Mine in western Fresno County with multiple operational units requiring comprehensive cleanup.",
    exposurePeriod: "1963-1990", 
    siteType: "Asbestos Mine",
    status: "Under Cleanup"
  },
  {
    id: 5,
    name: "Minneapolis, Minnesota",
    type: "Vermiculite",
    imageBase64: "https://www.asbestos.com/wp-content/uploads/33422780835_fec81ed78c_c-1.jpg", // Dust cloud at Zonolite mill (vermiculite processing context)
    imageMimeType: "image/jpeg",
    description: "Western Mineral Products processed Libby vermiculite ore from 1938-1989, affecting 268 residential properties.",
    exposurePeriod: "1938-1989",
    siteType: "Processing Plant", 
    status: "Cleaned Up"
  },
  {
    id: 6,
    name: "San Jose, California",
    type: "EPA Superfund",
    imageBase64: "https://www.asbestos.com/wp-content/uploads/33422769045_282c1f0158_c-1.jpg", // Asbestos-tainted vermiculite used in community areas
    imageMimeType: "image/jpeg",
    description: "South Bay Asbestos Area with landfills that accepted asbestos-containing materials from pipe manufacturing operations.",
    exposurePeriod: "1950s-1980s",
    siteType: "Landfill/Manufacturing",
    status: "Under Cleanup"
  }
];

async function seedAuthenticImages() {
  try {
    console.log('Seeding featured sites with authentic images...');
    
    // Clear existing data
    await db.delete(featuredSites);
    
    // Insert featured sites data with authentic image URLs
    await db.insert(featuredSites).values(featuredSitesData);
    
    console.log('Featured sites with authentic images seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding featured sites:', error);
    process.exit(1);
  }
}

seedAuthenticImages();