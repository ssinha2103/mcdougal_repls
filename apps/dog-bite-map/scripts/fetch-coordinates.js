// Script to fetch official Census coordinates for North Shore towns
const towns = [
  'Salem','Beverly','Lynn','Peabody','Danvers','Marblehead','Swampscott','Nahant',
  'Saugus','Revere','Melrose','Wakefield','Reading','Lynnfield','Middleton','Topsfield',
  'Wenham','Hamilton','Ipswich','Essex','Manchester-by-the-Sea','Gloucester','Rockport',
  'Rowley','Newbury','Newburyport','West Newbury','Amesbury','Salisbury','Haverhill',
  'Lawrence','Methuen Town','Boxford','Andover','North Reading'
];

// Build TIGERweb (Census) query
const where = `STATE='MA' AND BASENAME IN (${towns.map(n => `'${n}'`).join(',')})`;
const url = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/1/query'
  + `?where=${encodeURIComponent(where)}&outFields=BASENAME,NAME,INTPTLAT,INTPTLON&f=json`;

(async () => {
  try {
    console.log('Fetching official Census coordinates...');
    const response = await fetch(url);
    const json = await response.json();
    
    // Build coordinates map
    const data = {};
    json.features.forEach(feature => {
      const name = feature.attributes.BASENAME;
      const lat = parseFloat(feature.attributes.INTPTLAT);
      const lon = parseFloat(feature.attributes.INTPTLON);
      data[name] = [lon, lat]; // Note: our format is [longitude, latitude]
    });
    
    // Add Byfield (village of Newbury)
    data['Byfield (village of Newbury)'] = [-70.9481097, 42.7598138];
    
    // Output in our format
    console.log('\n=== Coordinates for towns.ts ===\n');
    
    // Map Census names to our names
    const nameMapping = {
      'Methuen Town': 'Methuen',
      'Manchester-by-the-Sea': 'Manchester-by-the-Sea',
      'West Newbury': 'West Newbury',
      'North Reading': 'North Reading',
      'Byfield (village of Newbury)': 'Byfield'
    };
    
    // Print each town with coordinates
    Object.keys(data).sort().forEach(town => {
      const displayName = nameMapping[town] || town;
      const [lon, lat] = data[town];
      console.log(`${displayName}: [${lon}, ${lat}]`);
    });
    
    console.log('\n=== Full JSON output ===\n');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error fetching coordinates:', error);
  }
})();