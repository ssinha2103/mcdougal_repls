// Fetch official Census coordinates for North Shore towns
import https from 'https';

const towns = [
  'Salem','Beverly','Lynn','Peabody','Danvers','Marblehead','Swampscott','Nahant',
  'Saugus','Revere','Melrose','Wakefield','Reading','Lynnfield','Middleton','Topsfield',
  'Wenham','Hamilton','Ipswich','Essex','Manchester-by-the-Sea','Gloucester','Rockport',
  'Rowley','Newbury','Newburyport','West Newbury','Amesbury','Salisbury','Haverhill',
  'Lawrence','Methuen Town','Boxford','Andover','North Reading'
];

const where = `STATE='MA' AND BASENAME IN (${towns.map(n => `'${n}'`).join(',')})`;
const params = new URLSearchParams({
  where: where,
  outFields: 'BASENAME,NAME,INTPTLAT,INTPTLON',
  f: 'json'
});

const url = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/1/query?${params.toString()}`;

https.get(url, (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });
  
  resp.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.features && json.features.length > 0) {
        console.log('Found', json.features.length, 'towns\n');
        
        // Create mapping
        const coordsMap = {};
        json.features.forEach(feature => {
          const name = feature.attributes.BASENAME;
          const lat = parseFloat(feature.attributes.INTPTLAT);
          const lon = parseFloat(feature.attributes.INTPTLON);
          
          // Handle special name mappings
          let mappedName = name;
          if (name === 'Methuen Town') mappedName = 'Methuen';
          
          coordsMap[mappedName] = {
            center: [lon, lat]
          };
        });
        
        // Add Byfield
        coordsMap['Byfield'] = {
          center: [-70.9481097, 42.7598138]
        };
        
        // Output as TypeScript update
        console.log('=== Updated coordinates for towns.ts ===\n');
        
        const sortedTowns = Object.keys(coordsMap).sort();
        sortedTowns.forEach(town => {
          const [lon, lat] = coordsMap[town].center;
          console.log(`  '${town}': center: [${lon.toFixed(6)}, ${lat.toFixed(6)}],`);
        });
        
        // Also output as full JSON
        console.log('\n=== Full JSON with all coordinates ===\n');
        console.log(JSON.stringify(coordsMap, null, 2));
      } else {
        console.log('No features found in response');
        console.log('Response:', JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching data:', err);
});