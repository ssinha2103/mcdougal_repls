import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { type AnalysisResponse, type LocalPackResult, type OrganicResult } from '@shared/schema';

export function exportToPDF(data: AnalysisResponse) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Local Legal SERP Analysis Report', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Keyword: ${data.keyword}`, 14, 32);
  doc.text(`Location: ${data.location}`, 14, 39);
  doc.text(`Date: ${new Date(data.timestamp).toLocaleString()}`, 14, 46);
  
  doc.setFontSize(14);
  doc.text('Summary Statistics', 14, 58);
  
  const summaryData = [
    ['Total Results', data.summary.totalResults.toString()],
    ['Average Rating', data.summary.avgRating !== null && data.summary.avgRating !== undefined ? data.summary.avgRating.toFixed(1) : 'N/A'],
    ['Claimed Percentage', data.summary.claimedPercentage !== null && data.summary.claimedPercentage !== undefined ? `${data.summary.claimedPercentage}%` : 'N/A'],
    ['Top Competitor', data.summary.topCompetitor ?? 'N/A'],
  ];
  
  autoTable(doc, {
    startY: 62,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });
  
  const localPackY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text('Local Pack Results (Top 3)', 14, localPackY);
  
  const localPackData = data.localPack.map(result => [
    result.position.toString(),
    result.title,
    result.rating !== null && result.rating !== undefined ? result.rating.toFixed(1) : 'N/A',
    result.reviewCount !== null && result.reviewCount !== undefined ? result.reviewCount.toString() : 'N/A',
    result.claimed === true ? 'Yes' : result.claimed === false ? 'No' : 'N/A',
    result.phone ?? 'N/A',
  ]);
  
  autoTable(doc, {
    startY: localPackY + 4,
    head: [['Rank', 'Business Name', 'Rating', 'Reviews', 'Claimed', 'Phone']],
    body: localPackData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });
  
  const organicY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text('Organic Results (Top 10)', 14, organicY);
  
  const organicData = data.organic.map(result => [
    result.position.toString(),
    result.title.substring(0, 40) + (result.title.length > 40 ? '...' : ''),
    result.domain ?? 'N/A',
    result.rating !== null && result.rating !== undefined ? result.rating.toFixed(1) : 'N/A',
    result.reviewCount !== null && result.reviewCount !== undefined ? result.reviewCount.toString() : 'N/A',
  ]);
  
  autoTable(doc, {
    startY: organicY + 4,
    head: [['Rank', 'Title', 'Domain', 'Rating', 'Reviews']],
    body: organicData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  });
  
  doc.save(`serp-analysis-${data.keyword.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportToCSV(data: AnalysisResponse) {
  const csvData: any[] = [];
  
  csvData.push({
    'Report Type': 'Summary',
    'Keyword': data.keyword,
    'Location': data.location,
    'Date': new Date(data.timestamp).toLocaleString(),
    'Total Results': data.summary.totalResults,
    'Avg Rating': data.summary.avgRating !== null && data.summary.avgRating !== undefined ? data.summary.avgRating.toFixed(1) : 'N/A',
    'Claimed %': data.summary.claimedPercentage !== null && data.summary.claimedPercentage !== undefined ? `${data.summary.claimedPercentage}%` : 'N/A',
    'Top Competitor': data.summary.topCompetitor ?? 'N/A',
  });
  
  csvData.push({});
  csvData.push({ 'Report Type': 'Local Pack Results' });
  
  data.localPack.forEach(result => {
    csvData.push({
      'Type': 'Local Pack',
      'Position': result.position,
      'Business Name': result.title,
      'Address': result.address ?? 'N/A',
      'Phone': result.phone ?? 'N/A',
      'Website': result.website ?? 'N/A',
      'Rating': result.rating !== null && result.rating !== undefined ? result.rating.toFixed(1) : 'N/A',
      'Review Count': result.reviewCount !== null && result.reviewCount !== undefined ? result.reviewCount : 'N/A',
      'Claimed': result.claimed === true ? 'Yes' : result.claimed === false ? 'No' : 'N/A',
      'Category': result.category ?? 'N/A',
    });
  });
  
  csvData.push({});
  csvData.push({ 'Report Type': 'Organic Results' });
  
  data.organic.forEach(result => {
    csvData.push({
      'Type': 'Organic',
      'Position': result.position,
      'Title': result.title,
      'URL': result.url,
      'Domain': result.domain ?? 'N/A',
      'Description': result.description ?? 'N/A',
      'Rating': result.rating !== null && result.rating !== undefined ? result.rating.toFixed(1) : 'N/A',
      'Review Count': result.reviewCount !== null && result.reviewCount !== undefined ? result.reviewCount : 'N/A',
      'Claimed': result.claimed === true ? 'Yes' : result.claimed === false ? 'No' : 'N/A',
    });
  });
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `serp-analysis-${data.keyword.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
