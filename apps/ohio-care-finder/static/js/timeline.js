// Closures Timeline Widget

async function loadClosures() {
    try {
        const response = await fetch('/api/closures?since=2022-01-01');
        const data = await response.json();
        displayTimeline(data.closures);
    } catch (error) {
        console.error('Error loading closures:', error);
    }
}

function displayTimeline(closures) {
    const timelineContent = document.getElementById('timelineContent');
    
    if (!timelineContent) return;
    
    if (closures.length === 0) {
        timelineContent.innerHTML = '<p class="no-data">No closures recorded since 2022</p>';
        return;
    }
    
    let html = '<div class="timeline-list">';
    
    closures.forEach(closure => {
        const date = new Date(closure.closure_date);
        const dateStr = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        html += `
            <div class="timeline-item">
                <div class="timeline-date">${dateStr}</div>
                <div class="timeline-content">
                    <h4>
                        <a href="/hospital/${closure.hospital_id}">${closure.hospital_name}</a>
                    </h4>
                    <p class="timeline-location">${closure.hospital_city}, ${closure.hospital_county} County</p>
                    <p class="timeline-service"><strong>${closure.service}</strong> service closed</p>
                    ${closure.notes ? `<p class="timeline-notes">${closure.notes}</p>` : ''}
                    ${closure.source_url ? `<p><a href="${closure.source_url}" target="_blank" rel="noopener">Source →</a></p>` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    timelineContent.innerHTML = html;
}

// Load closures when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadClosures();
});
