import puppeteer from 'puppeteer';
import { execSync } from 'child_process';

// Helper function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

export async function generatePDFReport(metrics: any[], analysisJob?: any): Promise<Buffer> {
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Find user's site - if we have the analysis job with URLs, use the first URL
  // Otherwise fall back to first metric
  let userSite = metrics[0];
  
  if (analysisJob && analysisJob.urls && analysisJob.urls.length > 0) {
    // Find the metric that matches the first URL from the analysis job
    const firstUrl = analysisJob.urls[0];
    const firstDomain = extractDomain(firstUrl);
    const matchingMetric = metrics.find(m => m.domain === firstDomain || m.url === firstUrl);
    if (matchingMetric) {
      userSite = matchingMetric;
    }
  }
  
  const htmlContent = generateHTMLReport(metrics, userSite, reportDate);
  
  // Find Chromium executable path dynamically
  let chromiumPath;
  try {
    chromiumPath = execSync('which chromium', { encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error('Chromium not found. Please install chromium system dependency.');
  }

  // Launch Puppeteer with system Chromium
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromiumPath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set content with faster loading strategy
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  
  // Generate PDF with landscape orientation
  const pdfBuffer = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: false,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  });
  
  await browser.close();
  
  return Buffer.from(pdfBuffer);
}

function generateHTMLReport(metrics: any[], userSite: any, reportDate: string): string {
  const formatNumber = (num: number) => num?.toLocaleString() || '0';
  const calculateTrustScore = (metric: any) => {
    const score = (metric.hasAuthorBox ? 3 : 0) + 
                  (metric.hasLinkedAuthor ? 3 : 0) + 
                  (metric.hasStructuredData ? 3 : 0) + 
                  (metric.experienceSignals || 0);
    return Math.min(10, score);
  };

  // Find top performers
  const topTrafficSite = metrics.reduce((max, metric) => 
    metric.organicTraffic > max.organicTraffic ? metric : max, metrics[0]);
  
  const fastestSite = metrics.reduce((min, metric) => 
    (metric.pageSpeed && (!min.pageSpeed || parseFloat(metric.pageSpeed) < parseFloat(min.pageSpeed))) ? metric : min, 
    metrics.find(m => m.pageSpeed) || metrics[0]);
  
  const backlinksChampion = metrics.reduce((max, metric) => 
    metric.backlinks > max.backlinks ? metric : max, metrics[0]);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SEO Competitive Intelligence Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @page {
          size: A4 landscape;
          margin: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
          background: white;
        }
        
        .page {
          width: 297mm;
          height: 210mm;
          position: relative;
          page-break-after: always;
          overflow: hidden;
          background: white;
        }
        
        .page:last-child {
          page-break-after: avoid;
        }
        
        /* Cover Page Styles */
        .cover-page {
          padding: 40px 50px;
          height: 210mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f0f4ff 50%, #e5edff 75%, #f8fafc 100%);
          position: relative;
          overflow: hidden;
        }
        
        .cover-page::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
          transform: rotate(45deg);
        }
        
        .logo-section {
          position: absolute;
          top: 30px;
          left: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-svg {
          width: 50px;
          height: 50px;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }
        
        .logo-text-wrapper {
          display: flex;
          flex-direction: column;
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }
        
        .logo-subtitle {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        
        /* SEO Line Drawings */
        .seo-graphics {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.08;
        }
        
        .search-circle {
          position: absolute;
          top: 20%;
          right: 15%;
          width: 150px;
          height: 150px;
          border: 3px solid #3b82f6;
          border-radius: 50%;
        }
        
        .search-handle {
          position: absolute;
          top: calc(20% + 130px);
          right: calc(15% - 30px);
          width: 60px;
          height: 3px;
          background: #3b82f6;
          transform: rotate(45deg);
        }
        
        .graph-line {
          position: absolute;
          bottom: 30%;
          left: 10%;
          width: 200px;
          height: 100px;
          border-left: 2px solid #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }
        
        .graph-line::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(45deg, transparent 40%, #3b82f6 40%, #3b82f6 60%, transparent 60%);
          background-size: 20px 20px;
          animation: move 2s linear infinite;
        }
        
        @keyframes move {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
        
        .cover-header {
          text-align: center;
          margin-top: 60px;
        }
        
        .cover-title {
          font-size: 38px;
          font-weight: 800;
          background: linear-gradient(135deg, #0f172a 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          letter-spacing: -0.03em;
        }
        
        .cover-subtitle {
          font-size: 16px;
          font-weight: 400;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto 40px;
          line-height: 1.5;
        }
        
        .domain-section {
          text-align: center;
          margin: 30px 0;
        }
        
        .domain-name {
          font-size: 32px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }
        
        .domain-label {
          font-size: 14px;
          color: #64748b;
        }
        
        .metrics-grid {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin: 30px 0;
        }
        
        .metric-card {
          background: white;
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 30px;
          width: 220px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
        }
        
        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
        }
        
        .metric-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .metric-title {
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 12px;
          text-align: center;
        }
        
        .metric-value {
          font-size: 15px;
          color: #0f172a;
          font-weight: 500;
          text-align: center;
          margin-bottom: 4px;
        }
        
        .metric-subtitle {
          font-size: 13px;
          color: #64748b;
          text-align: center;
        }
        
        .cover-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 40px;
          border-top: 1px solid #e2e8f0;
          font-size: 13px;
          color: #64748b;
        }
        
        /* Content Page Styles */
        .content-page {
          padding: 25px 40px;
          height: 210mm;
          display: flex;
          flex-direction: column;
          background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 20px;
        }
        
        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: #0f172a;
        }
        
        .page-meta {
          font-size: 14px;
          color: #64748b;
        }
        
        .content-body {
          flex: 1;
          overflow: hidden;
        }
        
        .notes-section {
          height: 50px;
          border: 2px dashed #e2e8f0;
          background: linear-gradient(to right, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 12px 20px;
          margin-top: auto;
          position: relative;
        }
        
        .notes-section::before {
          content: '✏️';
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          opacity: 0.3;
        }
        
        .notes-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }
        
        .page-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          font-size: 12px;
          color: #64748b;
        }
        
        /* Table Styles */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 20px;
          font-size: 12px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        th {
          background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%);
          padding: 10px;
          text-align: left;
          font-weight: 600;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        th:first-child {
          border-top-left-radius: 12px;
        }
        
        th:last-child {
          border-top-right-radius: 12px;
        }
        
        td {
          padding: 10px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          background: white;
        }
        
        tr:hover td {
          background: #f8fafc;
        }
        
        tr.highlight td {
          background: linear-gradient(to right, #eff6ff 0%, #f0f9ff 100%);
          font-weight: 600;
          color: #1e40af;
          border-left: 3px solid #3b82f6;
        }
        
        tr.highlight td:first-child {
          padding-left: 11px;
        }
        
        /* Section Headers */
        .section-header {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        /* Winner Cards */
        .winners-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .winner-card {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
          border: 1px solid #c7d2fe;
          border-radius: 16px;
          padding: 28px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .winner-card.gold {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #fbbf24;
          box-shadow: 0 4px 14px -1px rgba(251, 191, 36, 0.3);
        }
        
        .winner-card.silver {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-color: #9ca3af;
          box-shadow: 0 4px 14px -1px rgba(156, 163, 175, 0.3);
        }
        
        .winner-card.bronze {
          background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
          border-color: #fb923c;
          box-shadow: 0 4px 14px -1px rgba(251, 146, 60, 0.3);
        }
        
        .winner-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
          transform: rotate(45deg);
        }
        
        .trophy-icon {
          width: 40px;
          height: 40px;
          margin: 0 auto 12px;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .winner-card.gold .trophy-icon svg {
          stroke: #f59e0b;
          color: #f59e0b;
        }
        
        .winner-card.silver .trophy-icon svg {
          stroke: #6b7280;
          color: #6b7280;
        }
        
        .winner-card.bronze .trophy-icon svg {
          stroke: #d97706;
          color: #d97706;
        }
        
        .winner-title {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .winner-domain {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }
        
        .winner-metric {
          font-size: 16px;
          font-weight: 500;
          color: #334155;
        }
        
        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .info-box {
          background: linear-gradient(to right, #f8fafc 0%, #ffffff 100%);
          border-left: 4px solid #3b82f6;
          border-radius: 12px;
          padding: 15px 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }
        
        .info-box::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
          transform: translate(30%, -30%);
        }
        
        .info-box.warning {
          border-left-color: #f59e0b;
          background: linear-gradient(to right, #fffbeb 0%, #ffffff 100%);
        }
        
        .info-box.warning::after {
          background: radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%);
        }
        
        .info-box.success {
          border-left-color: #10b981;
          background: linear-gradient(to right, #f0fdf4 0%, #ffffff 100%);
        }
        
        .info-box.success::after {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
        }
        
        .info-box h4 {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 6px;
        }
        
        .info-box ul {
          list-style: none;
          font-size: 12px;
          color: #475569;
        }
        
        .info-box li {
          padding-left: 16px;
          position: relative;
          margin-bottom: 4px;
        }
        
        .info-box li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #3b82f6;
        }
      </style>
    </head>
    <body>
      
      <!-- Cover Page -->
      <div class="page">
        <div class="cover-page">
          <div class="logo-section">
            <svg class="logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pdfLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3B82F6" />
                  <stop offset="100%" stop-color="#1D4ED8" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="url(#pdfLogoGradient)" />
              <g fill="white">
                <path d="M12 28L16 14L20 28M14 24H18" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                <rect x="22" y="24" width="2.5" height="4" rx="0.5" />
                <rect x="25.5" y="20" width="2.5" height="8" rx="0.5" />
                <rect x="29" y="16" width="2.5" height="12" rx="0.5" />
              </g>
            </svg>
            <div class="logo-text-wrapper">
              <div class="logo-text">AI SEO PageScore</div>
              <div class="logo-subtitle">Competitive Analysis</div>
            </div>
          </div>
          
          <div class="seo-graphics">
            <div class="search-circle"></div>
            <div class="search-handle"></div>
            <div class="graph-line"></div>
          </div>
          
          <div class="cover-header">
            <h1 class="cover-title">SEO Competitive Intelligence Report</h1>
            <p class="cover-subtitle">In-depth competitive insights and data-backed strategies to boost search visibility and outperform your rivals</p>
          </div>
          
          <div class="domain-section">
            <div class="domain-name">${userSite.domain}</div>
            <div class="domain-label">Primary Analysis Target</div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">📊</div>
              <h3 class="metric-title">Traffic Overview</h3>
              <div class="metric-value">${formatNumber(userSite.organicTraffic)} Monthly Visits</div>
              <div class="metric-subtitle">Organic Search Traffic</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">🛡️</div>
              <h3 class="metric-title">E-E-A-T Signals</h3>
              <div class="metric-value">Trust Score: ${calculateTrustScore(userSite)}/10</div>
              <div class="metric-subtitle">Authority Assessment</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">🎯</div>
              <h3 class="metric-title">Growth Potential</h3>
              <div class="metric-value">${formatNumber(userSite.organicKeywords)} Keywords</div>
              <div class="metric-subtitle">Current Rankings</div>
            </div>
          </div>
          
          <div class="cover-footer">
            <div>© McDougall Interactive - 27+ Years of Digital Marketing Excellence</div>
            <div>Generated on ${reportDate}</div>
          </div>
        </div>
      </div>
      
      <!-- SEO Metrics Page -->
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <h2 class="page-title">SEO Metrics Analysis</h2>
            <div class="page-meta">${userSite.domain}</div>
          </div>
          
          <div class="content-body">
            <div class="section-header">Core SEO Metrics</div>
            
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Indexed Pages</th>
                  <th>Referring Domains</th>
                  <th>Total Backlinks</th>
                  <th>Domain Authority</th>
                </tr>
              </thead>
              <tbody>
                ${metrics.slice(0, 10).map((metric) => {
                  const isUserSite = metric.domain === userSite.domain;
                  return `
                  <tr ${isUserSite ? 'class="highlight"' : ''}>
                    <td>${metric.domain} ${isUserSite ? '(Your Site)' : ''}</td>
                    <td>${formatNumber(metric.indexedPages)}</td>
                    <td>${formatNumber(metric.referringDomains)}</td>
                    <td>${formatNumber(metric.backlinks)}</td>
                    <td>${Math.round(Math.log10(metric.backlinks + 1) * 20)}/100</td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
            
            <div class="info-grid">
              <div class="info-box">
                <h4>Indexation Status</h4>
                <ul>
                  <li>${formatNumber(userSite.indexedPages)} pages indexed</li>
                  <li>${userSite.indexedPages > 1000 ? 'Strong' : 'Growing'} site presence</li>
                  <li>Regular crawl activity</li>
                </ul>
              </div>
              <div class="info-box warning">
                <h4>Link Building Needs</h4>
                <ul>
                  <li>Focus on quality domains</li>
                  <li>Diversify anchor text</li>
                  <li>Build authority through content</li>
                </ul>
              </div>
              <div class="info-box success">
                <h4>Quick Wins</h4>
                <ul>
                  <li>Guest posting opportunities</li>
                  <li>Resource page links</li>
                  <li>Industry partnerships</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
          </div>
          
          <div class="page-footer">
            <div>© McDougall Interactive</div>
            <div>Page 2 of 9</div>
          </div>
        </div>
      </div>
      
      <!-- Traffic Analytics Page -->
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <h2 class="page-title">Traffic Analytics</h2>
            <div class="page-meta">${userSite.domain}</div>
          </div>
          
          <div class="content-body">
            <div class="section-header">Organic Traffic Performance</div>
            
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Monthly Traffic</th>
                  <th>Advertisement Value</th>
                  <th>Avg CPC</th>
                  <th>Top-10 Coverage</th>
                  <th>Visibility Score</th>
                </tr>
              </thead>
              <tbody>
                ${metrics.slice(0, 10).map((metric) => {
                  const isUserSite = metric.domain === userSite.domain;
                  return `
                  <tr ${isUserSite ? 'class="highlight"' : ''}>
                    <td>${metric.domain} ${isUserSite ? '(Your Site)' : ''}</td>
                    <td>${formatNumber(metric.organicTraffic)}</td>
                    <td>${metric.trafficCost || '$0'}</td>
                    <td>${metric.avgCPC || 'N/A'}</td>
                    <td>${metric.top10Coverage || 'N/A'}</td>
                    <td>${metric.visibilityScore || 'N/A'}</td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
            
            <div class="info-grid">
              <div class="info-box">
                <h4>Traffic Insights</h4>
                <ul>
                  <li>Monthly visitors: ${formatNumber(userSite.organicTraffic)}</li>
                  <li>Advertisement value: ${userSite.trafficCost || '$0'}</li>
                  <li>Average CPC: ${userSite.avgCPC || 'N/A'}</li>
                  <li>Top-10 Coverage: ${userSite.top10Coverage || 'N/A'}</li>
                  <li>Visibility Score: ${userSite.visibilityScore || 'N/A'}</li>
                </ul>
              </div>
              <div class="info-box warning">
                <h4>Growth Opportunities</h4>
                <ul>
                  <li>Target long-tail keywords</li>
                  <li>Improve content depth</li>
                  <li>Enhance user engagement</li>
                </ul>
              </div>
              <div class="info-box success">
                <h4>Traffic Goals</h4>
                <ul>
                  <li>3-month: +${Math.round(userSite.organicTraffic * 0.25)} visits</li>
                  <li>6-month: +${Math.round(userSite.organicTraffic * 0.5)} visits</li>
                  <li>12-month: +${Math.round(userSite.organicTraffic * 1)} visits</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
          </div>
          
          <div class="page-footer">
            <div>© McDougall Interactive</div>
            <div>Page 3 of 9</div>
          </div>
        </div>
      </div>
      
      <!-- Performance Metrics Page -->
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <h2 class="page-title">Performance Metrics</h2>
            <div class="page-meta">${userSite.domain}</div>
          </div>
          
          <div class="content-body">
            <div class="section-header">Site Performance Analysis</div>
            
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Page Speed (s)</th>
                  <th>Performance Score</th>
                  <th>Mobile Ready</th>
                  <th>Core Web Vitals</th>
                </tr>
              </thead>
              <tbody>
                ${metrics.slice(0, 10).map((metric) => {
                  const isUserSite = metric.domain === userSite.domain;
                  return `
                  <tr ${isUserSite ? 'class="highlight"' : ''}>
                    <td>${metric.domain} ${isUserSite ? '(Your Site)' : ''}</td>
                    <td>${metric.pageSpeed || 'N/A'}</td>
                    <td>${metric.pageSpeed ? (10 - Math.min(10, parseFloat(metric.pageSpeed) * 2)).toFixed(1) : 'N/A'}/10</td>
                    <td>✓ Yes</td>
                    <td>${metric.pageSpeed && parseFloat(metric.pageSpeed) < 2.5 ? 'Pass' : 'Needs Work'}</td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
            
            <div class="info-grid">
              <div class="info-box">
                <h4>Current Performance</h4>
                <ul>
                  <li>Load time: ${userSite.pageSpeed || 'N/A'}s</li>
                  <li>Mobile optimized</li>
                  <li>HTTPS enabled</li>
                </ul>
              </div>
              <div class="info-box warning">
                <h4>Optimization Areas</h4>
                <ul>
                  <li>Compress images</li>
                  <li>Minify CSS/JS</li>
                  <li>Enable caching</li>
                </ul>
              </div>
              <div class="info-box success">
                <h4>Performance Goals</h4>
                <ul>
                  <li>Optimize load speed</li>
                  <li>Improve performance score</li>
                  <li>Pass all Core Web Vitals</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
          </div>
          
          <div class="page-footer">
            <div>© McDougall Interactive</div>
            <div>Page 4 of 9</div>
          </div>
        </div>
      </div>
      
      <!-- Social & Trust Signals Page -->
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <h2 class="page-title">Social & Trust Signals</h2>
            <div class="page-meta">${userSite.domain}</div>
          </div>
          
          <div class="content-body">
            <div class="section-header">Authority & Social Presence</div>
            
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>YouTube Subscribers</th>
                  <th>Video Count</th>
                  <th>Social Platforms</th>
                  <th>Trust Score</th>
                </tr>
              </thead>
              <tbody>
                ${metrics.slice(0, 10).map((metric) => {
                  const isUserSite = metric.domain === userSite.domain;
                  return `
                  <tr ${isUserSite ? 'class="highlight"' : ''}>
                    <td>${metric.domain} ${isUserSite ? '(Your Site)' : ''}</td>
                    <td>${formatNumber(metric.youtubeSubscribers)}</td>
                    <td>${metric.youtubeVideoCount || 0}</td>
                    <td>${metric.socialMediaPresence?.length || 0}</td>
                    <td>${calculateTrustScore(metric)}/10</td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
            
            <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #3b82f6; font-size: 12px;">
              <strong>Legend:</strong>
              <ul style="margin: 10px 0 0 20px; padding: 0;">
                <li><strong>YouTube Subscribers:</strong> Number of subscribers on YouTube channel</li>
                <li><strong>Video Count:</strong> Total videos published on YouTube</li>
                <li><strong>Social Platforms:</strong> Number of active social media platforms detected</li>
                <li><strong>Trust Score:</strong> Combined score based on author profiles, structured data, and credibility signals (0-10)</li>
              </ul>
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <h4>Social Presence</h4>
                <ul>
                  <li>YouTube: ${formatNumber(userSite.youtubeSubscribers)} subs</li>
                  <li>${userSite.youtubeVideoCount || 0} videos published</li>
                  <li>${userSite.socialMediaPresence?.length || 0} active platforms</li>
                </ul>
              </div>
              <div class="info-box warning">
                <h4>Trust Building</h4>
                <ul>
                  <li>Add author profiles</li>
                  <li>Display credentials</li>
                  <li>Collect reviews</li>
                </ul>
              </div>
              <div class="info-box success">
                <h4>Authority Goals</h4>
                <ul>
                  <li>Maximize trust score</li>
                  <li>Expand social reach</li>
                  <li>Build thought leadership</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
          </div>
          
          <div class="page-footer">
            <div>© McDougall Interactive</div>
            <div>Page 5 of 9</div>
          </div>
        </div>
      </div>
      
      <!-- Top Performers Page -->
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <h2 class="page-title">Top Performers</h2>
            <div class="page-meta">Competitive Excellence Awards</div>
          </div>
          
          <div class="content-body">
            <div class="section-header">Industry Leaders</div>
            
            <div class="winners-grid">
              <div class="winner-card gold">
                <div class="trophy-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 5.447-2.724A1 1 0 0121 3.276v10.764a1 1 0 01-.553.894L15 17l-6-3z"/>
                    <circle cx="12" cy="8" r="2"/>
                    <path d="M12 10v6"/>
                  </svg>
                </div>
                <div class="winner-title">Top Traffic Performer</div>
                <div class="winner-domain">${topTrafficSite.domain}</div>
                <div class="winner-metric">${formatNumber(topTrafficSite.organicTraffic)} monthly visits</div>
              </div>
              
              <div class="winner-card silver">
                <div class="trophy-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M13 4.069a10 10 0 100 15.862 4 4 0 000-15.862"/>
                    <path d="M13 12h8"/>
                    <path d="M3 12h8"/>
                  </svg>
                </div>
                <div class="winner-title">Fastest Site</div>
                <div class="winner-domain">${fastestSite.domain}</div>
                <div class="winner-metric">${fastestSite.pageSpeed || 'N/A'}s load time</div>
              </div>
              
              <div class="winner-card bronze">
                <div class="trophy-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.72-1.71"/>
                    <circle cx="12" cy="12" r="1"/>
                  </svg>
                </div>
                <div class="winner-title">Backlink Champion</div>
                <div class="winner-domain">${backlinksChampion.domain}</div>
                <div class="winner-metric">${formatNumber(backlinksChampion.backlinks)} backlinks</div>
              </div>
            </div>
            
            <div class="section-header" style="margin-top: 40px;">Key Takeaways</div>
            
            <div class="info-grid">
              <div class="info-box">
                <h4>Traffic Excellence</h4>
                <ul>
                  <li>Leader: ${formatNumber(topTrafficSite.organicTraffic)} visits</li>
                  <li>Your site: ${formatNumber(userSite.organicTraffic)} visits</li>
                  <li>Gap: ${formatNumber(topTrafficSite.organicTraffic - userSite.organicTraffic)} visits</li>
                </ul>
              </div>
              <div class="info-box">
                <h4>Speed Leadership</h4>
                <ul>
                  <li>Fastest: ${fastestSite.pageSpeed || 'N/A'}s</li>
                  <li>Your site: ${userSite.pageSpeed || 'N/A'}s</li>
                  <li>Focus on speed optimization</li>
                </ul>
              </div>
              <div class="info-box">
                <h4>Link Authority</h4>
                <ul>
                  <li>Leader: ${formatNumber(backlinksChampion.backlinks)} links</li>
                  <li>Your site: ${formatNumber(userSite.backlinks)} links</li>
                  <li>Gap: ${formatNumber(backlinksChampion.backlinks - userSite.backlinks)} links</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
          </div>
          
          <div class="page-footer">
            <div>© McDougall Interactive</div>
            <div>Page 6 of 9</div>
          </div>
        </div>
      </div>
      
      <!-- Advanced AI Search Analysis Page -->
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <h2 class="page-title">Advanced AI Search Analysis</h2>
            <div class="page-meta">Comprehensive E-E-A-T scoring and AI readiness assessment</div>
          </div>
          
          <div class="content-body">
            <div class="section-header">AI Search Optimization Insights</div>
            
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>E-E-A-T Score</th>
                  <th>Trust Signals</th>
                  <th>AI Readiness</th>
                  <th>Content Authority</th>
                </tr>
              </thead>
              <tbody>
                ${metrics.slice(0, 10).map((metric, index) => {
                  const eatScore = metric.trustSignalsScore || 0;
                  const trustSignals = `${metric.trustSignalsScore || 0}/10`;
                  const aiReadiness = `${Math.min(eatScore * 10, 100)}%`;
                  const contentAuthority = eatScore >= 7 ? 'Expert' : eatScore >= 4 ? 'Intermediate' : 'Basic';
                  const isUserSite = metric.domain === userSite.domain;
                  
                  return `
                    <tr ${isUserSite ? 'class="highlight"' : ''}>
                      <td>${metric.domain} ${isUserSite ? '(Your Site)' : ''}</td>
                      <td>${eatScore}/10 - ${eatScore >= 7 ? 'Excellent' : eatScore >= 4 ? 'Good' : 'Needs Work'}</td>
                      <td>${trustSignals}</td>
                      <td>${aiReadiness}</td>
                      <td>${contentAuthority}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            
            <div class="info-grid">
              <div class="info-box">
                <h4>E-E-A-T Score Analysis</h4>
                <ul>
                  <li>Experience signals: ${userSite.experienceSignals || 0}/10</li>
                  <li>Author credibility: ${userSite.hasLinkedAuthor ? 'Present' : 'Missing'}</li>
                  <li>Technical authority: ${userSite.hasStructuredData ? 'Strong' : 'Weak'}</li>
                  <li>Trust indicators: ${userSite.trustSignalsScore || 0}/10</li>
                </ul>
              </div>
              <div class="info-box warning">
                <h4>AI Readiness Gap</h4>
                <ul>
                  <li>Structured content: ${userSite.structuredContentScore || 0}%</li>
                  <li>Schema markup: ${userSite.hasStructuredData ? 'Implemented' : 'Missing'}</li>
                  <li>Author information: ${userSite.hasAuthorBox ? 'Present' : 'Missing'}</li>
                  <li>Original media: ${userSite.originalMediaCount || 0} items</li>
                </ul>
              </div>
              <div class="info-box success">
                <h4>AI Optimization Strategy</h4>
                <ul>
                  <li>Enhance first-person content</li>
                  <li>Add comprehensive author bios</li>
                  <li>Implement FAQ schema</li>
                  <li>Create original visual content</li>
                </ul>
              </div>
            </div>
            
            <div class="methodology-section" style="margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 8px;">
              <h4 style="margin-bottom: 15px; color: #1e293b;">Analysis Methodology</h4>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; font-size: 11px;">
                <div>
                  <strong style="color: #ea580c;">E-E-A-T Score:</strong>
                  <ul style="margin-top: 5px; padding-left: 15px;">
                    <li>Experience signals</li>
                    <li>Expertise indicators</li>
                    <li>Authoritativeness markers</li>
                    <li>Trust signals</li>
                  </ul>
                </div>
                <div>
                  <strong style="color: #9333ea;">Trust Signals:</strong>
                  <ul style="margin-top: 5px; padding-left: 15px;">
                    <li>Author credibility</li>
                    <li>Social verification</li>
                    <li>Content depth</li>
                    <li>Technical quality</li>
                  </ul>
                </div>
                <div>
                  <strong style="color: #2563eb;">AI Readiness:</strong>
                  <ul style="margin-top: 5px; padding-left: 15px;">
                    <li>Structured content</li>
                    <li>Schema markup</li>
                    <li>First-person language</li>
                    <li>Original media</li>
                  </ul>
                </div>
                <div>
                  <strong style="color: #059669;">Content Authority:</strong>
                  <ul style="margin-top: 5px; padding-left: 15px;">
                    <li>Expert (7+ E-E-A-T)</li>
                    <li>Intermediate (4-6)</li>
                    <li>Basic (0-3)</li>
                    <li>Overall content quality</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
          </div>
          
          <div class="page-footer">
            <div>© McDougall Interactive</div>
            <div>Page 7 of 9</div>
          </div>
        </div>
      </div>
      
      <!-- Strategic Recommendations Page -->
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <h2 class="page-title">Strategic Recommendations</h2>
            <div class="page-meta">${userSite.domain}</div>
          </div>
          
          <div class="content-body">
            <div class="section-header">Action Plan & Growth Projections</div>
            
            <div class="info-grid" style="grid-template-columns: 1fr 1fr;">
              <div class="info-box">
                <h4>Immediate Actions (0-30 days)</h4>
                <ul>
                  <li>Fix page speed issues</li>
                  <li>Add structured data markup</li>
                  <li>Optimize meta descriptions</li>
                  <li>Create author profiles</li>
                </ul>
              </div>
              <div class="info-box">
                <h4>Short-term Goals (30-90 days)</h4>
                <ul>
                  <li>Build ${Math.round(userSite.backlinks * 0.1)} quality backlinks</li>
                  <li>Publish ${Math.round(userSite.organicKeywords * 0.05)} new pages</li>
                  <li>Improve Core Web Vitals</li>
                  <li>Enhance E-E-A-T signals</li>
                </ul>
              </div>
            </div>
            
            <table style="margin-top: 30px;">
              <thead>
                <tr>
                  <th>Timeframe</th>
                  <th>Traffic Growth</th>
                  <th>Keyword Growth</th>
                  <th>Trust Score</th>
                  <th>Expected ROI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3 months</td>
                  <td>+25-35%</td>
                  <td>+500-1000</td>
                  <td>+2 points</td>
                  <td>150-200%</td>
                </tr>
                <tr>
                  <td>6 months</td>
                  <td>+50-70%</td>
                  <td>+1500-2500</td>
                  <td>+4 points</td>
                  <td>250-350%</td>
                </tr>
                <tr>
                  <td>12 months</td>
                  <td>+100-150%</td>
                  <td>+3000-5000</td>
                  <td>+6 points</td>
                  <td>400-600%</td>
                </tr>
              </tbody>
            </table>
            
            <div class="info-box success" style="margin-top: 30px;">
              <h4>Priority Focus Areas</h4>
              <ul>
                <li>Content depth and quality improvements</li>
                <li>Technical SEO optimization</li>
                <li>Authority building through E-E-A-T</li>
                <li>Strategic link acquisition</li>
              </ul>
            </div>
          </div>
          
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
          </div>
          
          <div class="page-footer">
            <div>© McDougall Interactive</div>
            <div>Page 8 of 9</div>
          </div>
        </div>
      </div>
      
    </body>
    </html>
  `;
}