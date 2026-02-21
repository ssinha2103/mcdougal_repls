// Utility functions for exporting keywords

export function generateCSV(keywords: string[]): string {
  return keywords.join('\n');
}

export function generateTXT(keywords: string[]): string {
  return keywords.join('\n');
}

export function generateJSON(keywords: string[]): string {
  return JSON.stringify(keywords, null, 2);
}

export function generateAdsCSV(
  keywords: string[], 
  campaignName: string = 'Campaign1', 
  adGroupName: string = 'AdGroup1'
): string {
  const headers = ['Campaign', 'Ad Group', 'Keyword', 'Match Type'];
  const rows = keywords.map(keyword => [
    campaignName,
    adGroupName,
    keyword,
    'Broad'
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

export function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
