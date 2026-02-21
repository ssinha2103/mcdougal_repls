// Official coordinates for North Shore MA towns
// Based on Census internal points and verified geographic centers

export const officialCoordinates = {
  // First batch - verified coordinates
  'Salem': [-70.8967155, 42.5195396],
  'Beverly': [-70.8800036, 42.5584395],
  'Lynn': [-70.9494756, 42.4668389],
  'Peabody': [-70.9286225, 42.5278394],
  'Danvers': [-70.9300030, 42.5750876],
  'Marblehead': [-70.8578296, 42.5001066],
  'Swampscott': [-70.9178318, 42.4750733],
  'Nahant': [-70.9217107, 42.4262065],
  'Saugus': [-71.0101229, 42.4648389],
  'Revere': [-71.0119732, 42.4084377],
  'Melrose': [-71.0661729, 42.4584381],
  'Wakefield': [-71.0728323, 42.5065404],
  'Reading': [-71.0951217, 42.5256401],
  'Lynnfield': [-71.0481213, 42.5384397],
  'Middleton': [-71.0162033, 42.5950876],
  'Topsfield': [-70.9500811, 42.6376072],
  'Wenham': [-70.8911627, 42.6039743],
  'Hamilton': [-70.8661625, 42.6298075],
  'Ipswich': [-70.8417279, 42.6792598],
  'Essex': [-70.7828275, 42.6320410],
  
  // Coastal towns with verified coordinates
  'Manchester-by-the-Sea': [-70.7689350, 42.5778743],
  'Gloucester': [-70.6620077, 42.6159263],
  'Rockport': [-70.6203566, 42.6556565],
  
  // Northern tier towns
  'Rowley': [-70.8787785, 42.7168000],
  'Newbury': [-70.8773, 42.7650], // Updated inland center
  'Newburyport': [-70.8772842, 42.8125865],
  'West Newbury': [-70.9897750, 42.8014738],
  'Amesbury': [-70.9300438, 42.8584038],
  'Salisbury': [-70.8605957, 42.8417233],
  
  // Western towns
  'Haverhill': [-71.0772796, 42.7762031],
  'Lawrence': [-71.1631137, 42.7070354],
  'Methuen': [-71.1908924, 42.7262020],
  'Boxford': [-70.9967265, 42.6611627],
  'Andover': [-71.1370071, 42.6583563],
  'North Reading': [-71.0781223, 42.5750871],
  
  // Village within Newbury
  'Byfield': [-70.9481097, 42.7598138]
};

// Print in format for towns.ts
console.log('=== Coordinates update for towns.ts ===\n');
Object.entries(officialCoordinates).forEach(([name, coords]) => {
  console.log(`  ${name}: center: [${coords[0]}, ${coords[1]}]`);
});