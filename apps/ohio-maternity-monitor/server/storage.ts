import Database from "better-sqlite3";
import path from "path";

export interface Hospital {
  id: number;
  ccn: string;
  hospital_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  county: string | null;
  phone: string | null;
  geo_lat: number | null;
  geo_lng: number | null;
  hospital_type: string | null;
  hospital_ownership: string | null;
  emergency_services: number;
  c_section_rate: number | null;
  low_risk_c_section_rate: number | null;
  maternal_morbidity_rate: number | null;
  complication_rate: number | null;
  early_elective_delivery_rate: number | null;
  is_birthing_friendly: number;
  has_nicu: number;
  nicu_level: string | null;
  features: string | null;
  description: string | null;
}

export interface HospitalSearchResult {
  id: number;
  name: string;
  address: string;
  city: string;
  zip: string;
  distance: number;
  lat: number;
  lng: number;
  phone: string;
  quality: {
    cSectionRate: number;
    isBirthingFriendly: boolean;
    maternalMorbidity: number;
    rating: 'Excellent' | 'Good' | 'Fair';
    complicationRate: number;
    earlyElectiveDelivery: number;
  };
  features: string[];
  description: string;
}

const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  "43015": { lat: 40.3053, lng: -83.0886 },
  "43016": { lat: 40.0992, lng: -83.1544 },
  "43017": { lat: 40.1170, lng: -83.0979 },
  "43018": { lat: 40.1261, lng: -82.9288 },
  "43040": { lat: 40.2299, lng: -83.3669 },
  "43050": { lat: 40.3992, lng: -82.4475 },
  "43054": { lat: 40.0867, lng: -82.7908 },
  "43055": { lat: 40.0482, lng: -82.4507 },
  "43078": { lat: 40.1079, lng: -83.7301 },
  "43081": { lat: 40.1192, lng: -82.9485 },
  "43110": { lat: 39.8487, lng: -82.7810 },
  "43113": { lat: 39.6102, lng: -82.9365 },
  "43123": { lat: 39.8812, lng: -83.0582 },
  "43130": { lat: 39.7188, lng: -82.5762 },
  "43140": { lat: 39.8931, lng: -83.4534 },
  "43147": { lat: 39.8848, lng: -82.7532 },
  "43205": { lat: 39.9521, lng: -82.9790 },
  "43210": { lat: 39.9940, lng: -83.0206 },
  "43213": { lat: 39.9773, lng: -82.8442 },
  "43214": { lat: 40.0312, lng: -83.0341 },
  "43215": { lat: 39.9605, lng: -82.9913 },
  "43228": { lat: 39.9532, lng: -83.1378 },
  "43302": { lat: 40.5712, lng: -83.1293 },
  "43311": { lat: 40.3684, lng: -83.7580 },
  "43326": { lat: 40.6465, lng: -83.5959 },
  "43351": { lat: 40.8404, lng: -83.2798 },
  "43402": { lat: 41.3756, lng: -83.6663 },
  "43420": { lat: 41.3393, lng: -83.1347 },
  "43452": { lat: 41.5058, lng: -82.9320 },
  "43506": { lat: 41.4741, lng: -84.5575 },
  "43512": { lat: 41.2845, lng: -84.3558 },
  "43543": { lat: 41.5905, lng: -84.5955 },
  "43545": { lat: 41.3923, lng: -84.1263 },
  "43567": { lat: 41.5404, lng: -84.1327 },
  "43606": { lat: 41.6738, lng: -83.5949 },
  "43608": { lat: 41.6686, lng: -83.5427 },
  "43614": { lat: 41.6195, lng: -83.6209 },
  "43616": { lat: 41.6206, lng: -83.4799 },
  "43701": { lat: 39.9748, lng: -82.0166 },
  "43713": { lat: 39.9930, lng: -81.1890 },
  "43725": { lat: 40.0317, lng: -81.5884 },
  "43812": { lat: 40.2708, lng: -81.8482 },
  "43907": { lat: 40.2574, lng: -80.9773 },
  "43920": { lat: 40.6215, lng: -80.5864 },
  "43952": { lat: 40.3544, lng: -80.6256 },
  "44004": { lat: 41.8806, lng: -80.7948 },
  "44011": { lat: 41.4700, lng: -81.9828 },
  "44024": { lat: 41.5086, lng: -81.1905 },
  "44030": { lat: 41.9385, lng: -80.5865 },
  "44035": { lat: 41.3668, lng: -82.0972 },
  "44041": { lat: 41.7994, lng: -80.9615 },
  "44053": { lat: 41.4366, lng: -82.2375 },
  "44074": { lat: 41.2952, lng: -82.2253 },
  "44077": { lat: 41.6636, lng: -81.2470 },
  "44104": { lat: 41.4993, lng: -81.6944 },
  "44106": { lat: 41.5058, lng: -81.6062 },
  "44109": { lat: 41.4604, lng: -81.6979 },
  "44111": { lat: 41.4494, lng: -81.8232 },
  "44113": { lat: 41.4870, lng: -81.7069 },
  "44119": { lat: 41.5969, lng: -81.5473 },
  "44122": { lat: 41.4497, lng: -81.4937 },
  "44124": { lat: 41.5190, lng: -81.4357 },
  "44125": { lat: 41.4212, lng: -81.5982 },
  "44129": { lat: 41.3815, lng: -81.7307 },
  "44130": { lat: 41.3699, lng: -81.8321 },
  "44145": { lat: 41.4361, lng: -81.9446 },
  "44195": { lat: 41.5013, lng: -81.6185 },
  "44223": { lat: 41.1330, lng: -81.5109 },
  "44254": { lat: 41.0353, lng: -82.0132 },
  "44256": { lat: 41.1390, lng: -81.8392 },
  "44266": { lat: 41.1757, lng: -81.2496 },
  "44304": { lat: 41.0815, lng: -81.5200 },
  "44305": { lat: 41.0680, lng: -81.4850 },
  "44307": { lat: 41.0784, lng: -81.5316 },
  "44308": { lat: 41.0792, lng: -81.5258 },
  "44309": { lat: 41.0807, lng: -81.5005 },
  "44310": { lat: 41.0970, lng: -81.5122 },
  "44460": { lat: 40.9013, lng: -80.8326 },
  "44482": { lat: 41.2353, lng: -80.7987 },
  "44484": { lat: 41.2292, lng: -80.7769 },
  "44501": { lat: 41.1139, lng: -80.6581 },
  "44512": { lat: 40.9942, lng: -80.6597 },
  "44601": { lat: 40.9030, lng: -81.1028 },
  "44622": { lat: 40.5149, lng: -81.4557 },
  "44654": { lat: 40.5649, lng: -81.9200 },
  "44667": { lat: 40.8318, lng: -81.7631 },
  "44691": { lat: 40.8212, lng: -81.9322 },
  "44708": { lat: 40.8142, lng: -81.3957 },
  "44710": { lat: 40.7989, lng: -81.3784 },
  "44805": { lat: 40.8590, lng: -82.3092 },
  "44811": { lat: 41.2877, lng: -82.8811 },
  "44820": { lat: 40.8152, lng: -82.9769 },
  "44830": { lat: 41.1636, lng: -83.4232 },
  "44833": { lat: 40.7307, lng: -82.8022 },
  "44857": { lat: 41.2246, lng: -82.6040 },
  "44870": { lat: 41.4455, lng: -82.7112 },
  "44875": { lat: 40.8822, lng: -82.6741 },
  "44883": { lat: 41.1051, lng: -83.2170 },
  "44890": { lat: 41.0389, lng: -82.7098 },
  "44903": { lat: 40.7527, lng: -82.5288 },
  "44906": { lat: 40.7715, lng: -82.5936 },
  "45005": { lat: 39.9923, lng: -83.0220 },
  "45013": { lat: 39.4158, lng: -84.5724 },
  "45014": { lat: 39.3111, lng: -84.5187 },
  "45040": { lat: 39.3468, lng: -84.2734 },
  "45056": { lat: 39.5124, lng: -84.7416 },
  "45069": { lat: 39.3584, lng: -84.3675 },
  "45103": { lat: 39.0802, lng: -84.1446 },
  "45123": { lat: 39.3488, lng: -83.3878 },
  "45133": { lat: 39.2214, lng: -83.6113 },
  "45177": { lat: 39.4439, lng: -83.8393 },
  "45211": { lat: 39.1809, lng: -84.5973 },
  "45219": { lat: 39.1366, lng: -84.5037 },
  "45220": { lat: 39.1388, lng: -84.5229 },
  "45229": { lat: 39.1413, lng: -84.5005 },
  "45236": { lat: 39.2122, lng: -84.4579 },
  "45242": { lat: 39.2514, lng: -84.3401 },
  "45255": { lat: 39.0860, lng: -84.3492 },
  "45342": { lat: 39.6383, lng: -84.2266 },
  "45365": { lat: 40.2869, lng: -84.1706 },
  "45373": { lat: 40.0392, lng: -84.2033 },
  "45385": { lat: 39.7009, lng: -83.9269 },
  "45404": { lat: 39.7741, lng: -84.1684 },
  "45405": { lat: 39.7697, lng: -84.2026 },
  "45409": { lat: 39.7445, lng: -84.1852 },
  "45429": { lat: 39.6962, lng: -84.1907 },
  "45440": { lat: 39.6788, lng: -84.1018 },
  "45459": { lat: 39.6374, lng: -84.1680 },
  "45502": { lat: 39.9249, lng: -83.8136 },
  "45504": { lat: 39.9242, lng: -83.8088 },
  "45601": { lat: 39.3964, lng: -82.9687 },
  "45631": { lat: 38.8465, lng: -82.2375 },
  "45640": { lat: 39.0322, lng: -82.6406 },
  "45662": { lat: 38.7536, lng: -82.9790 },
  "45679": { lat: 38.9342, lng: -83.5846 },
  "45690": { lat: 39.1172, lng: -83.0058 },
  "45701": { lat: 39.3273, lng: -82.1143 },
  "45750": { lat: 39.4317, lng: -81.4645 },
  "45801": { lat: 40.7404, lng: -84.1192 },
  "45804": { lat: 40.7359, lng: -84.0859 },
  "45817": { lat: 40.8876, lng: -83.8972 },
  "45828": { lat: 40.4807, lng: -84.6401 },
  "45840": { lat: 41.0177, lng: -83.6516 },
  "45879": { lat: 41.1344, lng: -84.6011 },
  "45891": { lat: 40.8507, lng: -84.5791 },
};

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

let hospitalZipCache: Record<string, { lat: number; lng: number }> | null = null;

function getZipCoordinates(zip: string, db?: Database.Database): { lat: number; lng: number } | null {
  if (ZIP_COORDS[zip]) {
    return ZIP_COORDS[zip];
  }
  
  if (db && !hospitalZipCache) {
    hospitalZipCache = {};
    const hospitals = db.prepare(`
      SELECT zip_code, geo_lat, geo_lng FROM hospitals 
      WHERE geo_lat IS NOT NULL AND geo_lng IS NOT NULL 
        AND geo_lat != 0 AND geo_lng != 0
    `).all() as { zip_code: string; geo_lat: number; geo_lng: number }[];
    
    for (const h of hospitals) {
      if (h.zip_code && !hospitalZipCache[h.zip_code]) {
        hospitalZipCache[h.zip_code] = { lat: h.geo_lat, lng: h.geo_lng };
      }
    }
  }
  
  if (hospitalZipCache && hospitalZipCache[zip]) {
    return hospitalZipCache[zip];
  }
  
  const zipNum = parseInt(zip.substring(0, 3));
  if (zipNum >= 430 && zipNum <= 459) {
    const latBase = 39.5;
    const lngBase = -82.0;
    const latOffset = ((zipNum - 430) % 10) * 0.15;
    const lngOffset = Math.floor((zipNum - 430) / 10) * 0.5;
    return { lat: latBase + latOffset, lng: lngBase - lngOffset };
  }
  return null;
}

function getRating(cSectionRate: number | null, maternalMorbidity: number | null): 'Excellent' | 'Good' | 'Fair' {
  const cRate = cSectionRate ?? 30;
  const mRate = maternalMorbidity ?? 2;
  if (cRate < 25 && mRate < 1.5) return 'Excellent';
  if (cRate < 30 && mRate < 2.0) return 'Good';
  return 'Fair';
}

export interface IStorage {
  searchHospitals(zip: string, riskLevel: 'low' | 'medium' | 'high', maxDistance: number): Promise<HospitalSearchResult[]>;
  getHospitalById(id: number): Promise<HospitalSearchResult | null>;
}

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), "maternity_care.db");
    this.db = new Database(dbPath);
  }

  async searchHospitals(zip: string, riskLevel: 'low' | 'medium' | 'high', maxDistance: number): Promise<HospitalSearchResult[]> {
    const userCoords = getZipCoordinates(zip, this.db);
    if (!userCoords) {
      return [];
    }

    const hospitals = this.db.prepare(`
      SELECT * FROM hospitals 
      WHERE geo_lat IS NOT NULL AND geo_lng IS NOT NULL
        AND geo_lat != 0 AND geo_lng != 0
    `).all() as Hospital[];

    const results: HospitalSearchResult[] = [];

    for (const h of hospitals) {
      if (!h.geo_lat || !h.geo_lng) continue;
      
      const distance = calculateDistance(userCoords.lat, userCoords.lng, h.geo_lat, h.geo_lng);
      if (distance > maxDistance) continue;

      results.push({
        id: h.id,
        name: h.hospital_name,
        address: h.address || '',
        city: h.city || '',
        zip: h.zip_code || '',
        distance: Math.round(distance * 10) / 10,
        lat: h.geo_lat,
        lng: h.geo_lng,
        phone: h.phone || '',
        quality: {
          cSectionRate: h.c_section_rate ?? 28,
          isBirthingFriendly: h.is_birthing_friendly === 1,
          maternalMorbidity: h.maternal_morbidity_rate ?? 1.5,
          rating: getRating(h.c_section_rate, h.maternal_morbidity_rate),
          complicationRate: h.complication_rate ?? 15,
          earlyElectiveDelivery: h.early_elective_delivery_rate ?? 2.0,
        },
        features: h.features ? h.features.split(',') : [],
        description: h.description || `${h.hospital_name} provides maternity care services in ${h.city}, Ohio.`,
      });
    }

    results.sort((a, b) => {
      if (riskLevel === 'high') {
        const aScore = a.quality.maternalMorbidity * 0.5 + a.quality.cSectionRate * 0.3 + (a.quality.isBirthingFriendly ? 0 : 10);
        const bScore = b.quality.maternalMorbidity * 0.5 + b.quality.cSectionRate * 0.3 + (b.quality.isBirthingFriendly ? 0 : 10);
        return aScore - bScore;
      } else if (riskLevel === 'medium') {
        const aScore = a.distance * 0.4 + a.quality.cSectionRate * 0.3 + a.quality.maternalMorbidity * 2;
        const bScore = b.distance * 0.4 + b.quality.cSectionRate * 0.3 + b.quality.maternalMorbidity * 2;
        return aScore - bScore;
      }
      const aScore = a.distance + (a.quality.isBirthingFriendly ? -5 : 0);
      const bScore = b.distance + (b.quality.isBirthingFriendly ? -5 : 0);
      return aScore - bScore;
    });

    return results;
  }

  async getHospitalById(id: number): Promise<HospitalSearchResult | null> {
    const h = this.db.prepare('SELECT * FROM hospitals WHERE id = ?').get(id) as Hospital | undefined;
    
    if (!h) return null;

    return {
      id: h.id,
      name: h.hospital_name,
      address: h.address || '',
      city: h.city || '',
      zip: h.zip_code || '',
      distance: 0,
      lat: h.geo_lat || 0,
      lng: h.geo_lng || 0,
      phone: h.phone || '',
      quality: {
        cSectionRate: h.c_section_rate ?? 28,
        isBirthingFriendly: h.is_birthing_friendly === 1,
        maternalMorbidity: h.maternal_morbidity_rate ?? 1.5,
        rating: getRating(h.c_section_rate, h.maternal_morbidity_rate),
        complicationRate: h.complication_rate ?? 15,
        earlyElectiveDelivery: h.early_elective_delivery_rate ?? 2.0,
      },
      features: h.features ? h.features.split(',') : [],
      description: h.description || `${h.hospital_name} provides maternity care services in ${h.city}, Ohio.`,
    };
  }
}

export const storage = new SQLiteStorage();
