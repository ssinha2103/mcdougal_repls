// Ohio Maternity Access Map - Main Application JavaScript

let map;
let hospitalLayer;
let allHospitals = [];

// Initialize map
function initMap() {
    map = L.map('map').setView([40.4173, -82.9071], 7); // Center on Ohio
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    loadHospitals();
}

// Get marker color based on NICU level
function getMarkerColor(nicuLevel) {
    switch (nicuLevel) {
        case 'IV':
            return '#dc143c'; // Red
        case 'III':
            return '#ff8c00'; // Orange
        case 'II':
            return '#3388ff'; // Blue
        default:
            return '#808080'; // Gray
    }
}

// Create custom marker HTML
function createMarkerIcon(hospital) {
    const color = getMarkerColor(hospital.nicu_level);
    const hasLD = hospital.has_ld ? '<div class="ld-badge">L&D</div>' : '';
    
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="marker-pin" style="background-color: ${color};">
                <div class="marker-dot"></div>
            </div>
            ${hasLD}
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -42]
    });
}

// Load hospitals from API
async function loadHospitals() {
    try {
        const response = await fetch('/api/hospitals');
        const data = await response.json();
        allHospitals = data.features;
        
        displayHospitals(allHospitals);
    } catch (error) {
        console.error('Error loading hospitals:', error);
    }
}

// Display hospitals on map
function displayHospitals(features) {
    if (hospitalLayer) {
        map.removeLayer(hospitalLayer);
    }
    
    hospitalLayer = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
    });
    
    features.forEach(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        
        const marker = L.marker([coords[1], coords[0]], {
            icon: createMarkerIcon(props)
        });
        
        const popupContent = `
            <div class="hospital-popup">
                <h4>${props.name}</h4>
                <p>${props.system}</p>
                <p>${props.city}, ${props.county} County</p>
                <p><strong>L&D:</strong> ${props.has_ld ? 'Yes' : 'No'}</p>
                <p><strong>NICU:</strong> ${props.nicu_level}</p>
                <a href="/hospital/${props.id}">View Details →</a>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        hospitalLayer.addLayer(marker);
    });
    
    map.addLayer(hospitalLayer);
}

// Filter hospitals based on current selections
function filterHospitals() {
    const ldOnly = document.getElementById('filterLD').checked;
    const nicuLevel = document.getElementById('filterNICU').value;
    
    const nicuLevels = {
        'II': ['II', 'III', 'IV'],
        'III': ['III', 'IV'],
        'IV': ['IV']
    };
    
    const filtered = allHospitals.filter(feature => {
        const props = feature.properties;
        
        if (ldOnly && !props.has_ld) return false;
        
        if (nicuLevel !== 'all') {
            if (!nicuLevels[nicuLevel].includes(props.nicu_level)) return false;
        }
        
        return true;
    });
    
    displayHospitals(filtered);
}

// Search by ZIP code
async function searchByZip() {
    const zipInput = document.getElementById('zipInput');
    const needSelect = document.getElementById('needSelect');
    const resultsDiv = document.getElementById('searchResults');
    
    const zip = zipInput.value.trim();
    const need = needSelect.value;
    
    if (!/^\d{5}$/.test(zip)) {
        resultsDiv.innerHTML = '<p class="error">Please enter a valid 5-digit ZIP code</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<p class="loading">Searching...</p>';
    
    try {
        const response = await fetch(`/api/search?zip=${zip}&need=${need}&limit=5`);
        
        if (!response.ok) {
            const error = await response.json();
            resultsDiv.innerHTML = `<p class="error">${error.detail}</p>`;
            return;
        }
        
        const data = await response.json();
        displaySearchResults(data);
        
        // Pan map to search location
        map.setView([data.lat, data.lng], 10);
        
        // Add search location marker
        L.marker([data.lat, data.lng], {
            icon: L.divIcon({
                className: 'search-marker',
                html: '<div class="search-pin">📍</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);
        
    } catch (error) {
        resultsDiv.innerHTML = '<p class="error">Error performing search</p>';
        console.error(error);
    }
}

// Display search results
function displaySearchResults(data) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (data.results.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">No hospitals found matching your criteria</p>';
        return;
    }
    
    const estimatedNote = data.results.some(r => r.is_estimated) 
        ? '<p class="info-note"><small>⚠️ Travel times estimated without live routing</small></p>' 
        : '';
    
    let html = `
        <h3>Nearest Hospitals (from ${data.zip})</h3>
        ${estimatedNote}
        <div class="results-list">
    `;
    
    data.results.forEach((hospital, idx) => {
        const etaHours = Math.floor(hospital.eta_minutes / 60);
        const etaMins = hospital.eta_minutes % 60;
        const etaText = etaHours > 0 
            ? `${etaHours}h ${etaMins}m` 
            : `${etaMins} min`;
        
        html += `
            <div class="result-item">
                <div class="result-rank">${idx + 1}</div>
                <div class="result-content">
                    <h4><a href="/hospital/${hospital.id}">${hospital.name}</a></h4>
                    <p>${hospital.city}, ${hospital.county} County</p>
                    <p class="result-meta">
                        <strong>${hospital.distance_km} km</strong> • ~${etaText} drive
                    </p>
                    <p class="result-services">
                        ${hospital.has_ld ? '<span class="badge badge-yes">L&D</span>' : ''}
                        <span class="badge">NICU ${hospital.nicu_level}</span>
                    </p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    // Search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchByZip);
    }
    
    // Enter key in ZIP input
    const zipInput = document.getElementById('zipInput');
    if (zipInput) {
        zipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchByZip();
        });
    }
    
    // Filter controls
    const filterLD = document.getElementById('filterLD');
    const filterNICU = document.getElementById('filterNICU');
    
    if (filterLD) filterLD.addEventListener('change', filterHospitals);
    if (filterNICU) filterNICU.addEventListener('change', filterHospitals);
    
    // Closures toggle
    const showClosures = document.getElementById('showClosures');
    if (showClosures) {
        showClosures.addEventListener('change', (e) => {
            const timeline = document.getElementById('timelineWidget');
            if (timeline) {
                timeline.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }
});
