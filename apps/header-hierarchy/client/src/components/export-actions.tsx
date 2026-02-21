import { type AnalysisResult } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Copy, 
  FileJson, 
  FileSpreadsheet, 
  FileText,
  FileImage 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";

interface ExportActionsProps {
  result: AnalysisResult;
}

// Helper function to properly escape CSV values
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

// Helper to handle Unicode properly
function createBlobWithBOM(content: string, type: string): Blob {
  // Add BOM for UTF-8 to ensure proper Unicode handling
  const BOM = '\uFEFF';
  return new Blob([BOM + content], { type: `${type};charset=utf-8` });
}

export function ExportActions({ result }: ExportActionsProps) {
  const { toast } = useToast();

  const exportToJSON = (includeFullData: boolean = true) => {
    const exportData = includeFullData ? {
      timestamp: new Date().toISOString(),
      ...result,
      metadata: {
        exportVersion: "2.0",
        includesFullAnalysis: true,
      }
    } : {
      url: result.url,
      headings: result.headings,
      statistics: result.statistics,
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heading-analysis-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported to JSON",
      description: `Analysis results downloaded ${includeFullData ? 'with full data' : 'with basic data'}`,
    });
  };

  const exportToCSV = (includeFullData: boolean = false) => {
    let csvContent: string;
    
    if (includeFullData) {
      // Full data export including all analysis details
      const rows: string[][] = [];
      
      // Add metadata section
      rows.push(['Analysis Report']);
      rows.push(['URL', escapeCSV(result.url)]);
      rows.push(['Analysis Date', escapeCSV(new Date().toISOString())]);
      rows.push([]);
      
      // Add statistics section
      rows.push(['Statistics']);
      rows.push(['Total Headings', String(result.statistics.total)]);
      rows.push(['H1 Count', String(result.statistics.h1Count)]);
      rows.push(['H2 Count', String(result.statistics.h2Count)]);
      rows.push(['H3 Count', String(result.statistics.h3Count)]);
      rows.push(['H4 Count', String(result.statistics.h4Count)]);
      rows.push(['H5 Count', String(result.statistics.h5Count)]);
      rows.push(['H6 Count', String(result.statistics.h6Count)]);
      rows.push([]);
      
      // Add accessibility section
      rows.push(['Accessibility']);
      rows.push(['Score', String(result.accessibility.score)]);
      rows.push(['Issues Count', String(result.accessibility.issues.length)]);
      result.accessibility.issues.forEach(issue => {
        rows.push(['Issue', escapeCSV(issue)]);
      });
      rows.push(['Recommendations Count', String(result.accessibility.recommendations.length)]);
      result.accessibility.recommendations.forEach(rec => {
        rows.push(['Recommendation', escapeCSV(rec)]);
      });
      rows.push([]);
      
      // Add errors section
      if (result.errors.length > 0) {
        rows.push(['SEO Errors']);
        rows.push(['Error Type', 'Message', 'Details']);
        result.errors.forEach(error => {
          rows.push([
            escapeCSV(error.type),
            escapeCSV(error.message),
            escapeCSV(error.details || '')
          ]);
        });
        rows.push([]);
      }
      
      // Add headings section
      rows.push(['Heading Structure']);
      rows.push(['Position', 'Level', 'Tag', 'Text']);
      result.headings.forEach((h, index) => {
        rows.push([
          String(index + 1),
          String(h.level),
          `H${h.level}`,
          escapeCSV(h.text || '(empty)')
        ]);
      });
      
      csvContent = rows.map(row => row.join(',')).join('\n');
    } else {
      // Basic headings export
      const headers = ['Position', 'Level', 'Text'];
      const rows = result.headings.map((h, index) => [
        String(index + 1),
        `H${h.level}`,
        escapeCSV(h.text || '(empty)')
      ]);
      
      csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
    }

    const blob = createBlobWithBOM(csvContent, 'text/csv');
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heading-analysis-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported to CSV",
      description: `Heading data downloaded ${includeFullData ? 'with full analysis' : 'successfully'}`,
    });
  };

  const exportToExcel = () => {
    // Create a simplified Excel-compatible CSV with proper formatting
    const rows: string[][] = [];
    
    // Title row
    rows.push(['Header Tag Analysis Report']);
    rows.push([]);
    
    // URL and date
    rows.push(['URL:', escapeCSV(result.url)]);
    rows.push(['Date:', new Date().toLocaleDateString()]);
    rows.push(['Time:', new Date().toLocaleTimeString()]);
    rows.push([]);
    
    // Summary statistics
    rows.push(['SUMMARY STATISTICS']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Headings', String(result.statistics.total)]);
    rows.push(['H1 Tags', String(result.statistics.h1Count)]);
    rows.push(['H2 Tags', String(result.statistics.h2Count)]);
    rows.push(['H3 Tags', String(result.statistics.h3Count)]);
    rows.push(['H4 Tags', String(result.statistics.h4Count)]);
    rows.push(['H5 Tags', String(result.statistics.h5Count)]);
    rows.push(['H6 Tags', String(result.statistics.h6Count)]);
    rows.push(['Accessibility Score', `${result.accessibility.score}%`]);
    rows.push(['SEO Issues', String(result.errors.length)]);
    rows.push([]);
    
    // SEO Issues
    if (result.errors.length > 0) {
      rows.push(['SEO ISSUES DETECTED']);
      rows.push(['Type', 'Message', 'Details']);
      result.errors.forEach(error => {
        rows.push([
          escapeCSV(error.type.replace(/_/g, ' ').toUpperCase()),
          escapeCSV(error.message),
          escapeCSV(error.details || 'N/A')
        ]);
      });
      rows.push([]);
    }
    
    // Accessibility
    rows.push(['ACCESSIBILITY ANALYSIS']);
    rows.push(['Score:', `${result.accessibility.score}%`]);
    if (result.accessibility.issues.length > 0) {
      rows.push([]);
      rows.push(['Issues:']);
      result.accessibility.issues.forEach(issue => {
        rows.push(['•', escapeCSV(issue)]);
      });
    }
    if (result.accessibility.recommendations.length > 0) {
      rows.push([]);
      rows.push(['Recommendations:']);
      result.accessibility.recommendations.forEach(rec => {
        rows.push(['•', escapeCSV(rec)]);
      });
    }
    rows.push([]);
    
    // Heading hierarchy
    rows.push(['HEADING HIERARCHY']);
    rows.push(['#', 'Level', 'Tag', 'Content']);
    result.headings.forEach((h, index) => {
      const indent = '  '.repeat(h.level - 1);
      rows.push([
        String(index + 1),
        String(h.level),
        `${indent}H${h.level}`,
        escapeCSV(h.text || '(empty heading)')
      ]);
    });
    
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = createBlobWithBOM(csvContent, 'text/csv');
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Use .csv extension but note it's Excel-compatible
    a.download = `heading-analysis-excel-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported for Excel",
      description: "Excel-compatible file downloaded successfully",
    });
  };

  const exportToMarkdown = () => {
    const lines: string[] = [];
    
    // Title and metadata
    lines.push(`# Header Tag Analysis Report`);
    lines.push('');
    lines.push(`**URL:** ${result.url}`);
    lines.push(`**Date:** ${new Date().toLocaleString()}`);
    lines.push('');
    
    // Statistics
    lines.push('## Summary Statistics');
    lines.push('');
    lines.push('| Metric | Count |');
    lines.push('|--------|-------|');
    lines.push(`| Total Headings | ${result.statistics.total} |`);
    lines.push(`| H1 | ${result.statistics.h1Count} |`);
    lines.push(`| H2 | ${result.statistics.h2Count} |`);
    lines.push(`| H3 | ${result.statistics.h3Count} |`);
    lines.push(`| H4 | ${result.statistics.h4Count} |`);
    lines.push(`| H5 | ${result.statistics.h5Count} |`);
    lines.push(`| H6 | ${result.statistics.h6Count} |`);
    lines.push('');
    
    // Accessibility
    lines.push('## Accessibility Analysis');
    lines.push('');
    lines.push(`**Score:** ${result.accessibility.score}/100`);
    lines.push('');
    
    if (result.accessibility.issues.length > 0) {
      lines.push('### Issues');
      result.accessibility.issues.forEach(issue => {
        lines.push(`- ${issue}`);
      });
      lines.push('');
    }
    
    if (result.accessibility.recommendations.length > 0) {
      lines.push('### Recommendations');
      result.accessibility.recommendations.forEach(rec => {
        lines.push(`- ${rec}`);
      });
      lines.push('');
    }
    
    // SEO Errors
    if (result.errors.length > 0) {
      lines.push('## SEO Issues');
      lines.push('');
      result.errors.forEach(error => {
        lines.push(`### ${error.type.replace(/_/g, ' ').toUpperCase()}`);
        lines.push(`**${error.message}**`);
        if (error.details) {
          lines.push(`> ${error.details}`);
        }
        lines.push('');
      });
    }
    
    // Heading Structure
    lines.push('## Heading Structure');
    lines.push('');
    lines.push('```');
    result.headings.forEach(h => {
      const indent = '  '.repeat(h.level - 1);
      lines.push(`${indent}H${h.level}: ${h.text || '(empty)'}`);
    });
    lines.push('```');
    
    const markdown = lines.join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heading-analysis-${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported to Markdown",
      description: "Markdown report downloaded successfully",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, indent: number = 0) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth - indent);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin + indent, yPos);
        yPos += fontSize * 0.5;
      });
    };

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SEO Analysis Report', pageWidth / 2, 25, { align: 'center' });
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // URL and Date
    addText(`URL: ${result.url}`, 11, true);
    yPos += 3;
    addText(`Analysis Date: ${new Date().toLocaleString()}`, 10);
    yPos += 10;

    // Statistics Section
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    addText('SUMMARY STATISTICS', 14, true);
    yPos += 8;
    
    const stats = [
      ['Total Headings', result.statistics.total],
      ['H1 Tags', result.statistics.h1Count],
      ['H2 Tags', result.statistics.h2Count],
      ['H3 Tags', result.statistics.h3Count],
      ['H4 Tags', result.statistics.h4Count],
      ['H5 Tags', result.statistics.h5Count],
      ['H6 Tags', result.statistics.h6Count],
    ];

    stats.forEach(([label, value]) => {
      addText(`${label}: ${value}`, 10);
      yPos += 2;
    });
    
    yPos += 8;

    // Accessibility Section
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    addText('ACCESSIBILITY ANALYSIS', 14, true);
    yPos += 8;
    addText(`Score: ${result.accessibility.score}/100`, 11, true);
    yPos += 6;

    if (result.accessibility.issues.length > 0) {
      addText('Issues:', 11, true);
      yPos += 4;
      result.accessibility.issues.forEach(issue => {
        addText(`• ${issue}`, 10, false, 5);
        yPos += 2;
      });
      yPos += 4;
    }

    if (result.accessibility.recommendations.length > 0) {
      addText('Recommendations:', 11, true);
      yPos += 4;
      result.accessibility.recommendations.forEach(rec => {
        addText(`• ${rec}`, 10, false, 5);
        yPos += 2;
      });
      yPos += 4;
    }

    yPos += 4;

    // SEO Errors Section
    if (result.errors.length > 0) {
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      
      addText('SEO ERRORS', 14, true);
      yPos += 8;

      result.errors.forEach(error => {
        doc.setFillColor(254, 226, 226);
        doc.rect(margin, yPos - 5, maxWidth, 8, 'F');
        addText(error.type.replace(/_/g, ' ').toUpperCase(), 11, true);
        yPos += 5;
        addText(error.message, 10);
        if (error.details) {
          yPos += 3;
          addText(error.details, 9, false, 5);
        }
        yPos += 8;
      });
    } else {
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      doc.setFillColor(220, 252, 231);
      doc.rect(margin, yPos - 5, maxWidth, 10, 'F');
      addText('✓ No SEO Issues Found', 12, true);
      yPos += 10;
    }

    yPos += 4;

    // Heading Hierarchy
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    addText('HEADING HIERARCHY', 14, true);
    yPos += 8;

    result.headings.forEach((h, index) => {
      const indent = (h.level - 1) * 5;
      const text = `H${h.level}: ${h.text || '(empty heading)'}`;
      addText(text, 9, false, indent);
      yPos += 1;
    });

    // Save PDF
    doc.save(`seo-analysis-${new Date().getTime()}.pdf`);

    toast({
      title: "Exported to PDF",
      description: "Professional PDF report downloaded successfully",
    });
  };

  const copyToClipboard = async (format: 'plain' | 'markdown' = 'plain') => {
    let text: string;
    
    if (format === 'markdown') {
      // Markdown format for easy sharing
      text = [
        `## Heading Analysis for ${result.url}`,
        '',
        `**Total Headings:** ${result.statistics.total}`,
        `**Accessibility Score:** ${result.accessibility.score}/100`,
        '',
        '### Statistics',
        `- H1: ${result.statistics.h1Count}`,
        `- H2: ${result.statistics.h2Count}`,
        `- H3: ${result.statistics.h3Count}`,
        `- H4: ${result.statistics.h4Count}`,
        `- H5: ${result.statistics.h5Count}`,
        `- H6: ${result.statistics.h6Count}`,
        '',
        result.errors.length > 0 ? `### SEO Issues (${result.errors.length})` : '### ✓ No SEO Issues',
        ...result.errors.map(e => `- ${e.message}`),
        '',
        '### Heading Structure',
        '```',
        ...result.headings.map(h => {
          const indent = '  '.repeat(h.level - 1);
          return `${indent}H${h.level}: ${h.text || '(empty)'}`;
        }),
        '```'
      ].join('\n');
    } else {
      // Plain text format
      text = [
        `Heading Analysis for ${result.url}`,
        `Total Headings: ${result.statistics.total}`,
        `Accessibility Score: ${result.accessibility.score}/100`,
        ``,
        `Statistics:`,
        `- H1: ${result.statistics.h1Count}`,
        `- H2: ${result.statistics.h2Count}`,
        `- H3: ${result.statistics.h3Count}`,
        `- H4: ${result.statistics.h4Count}`,
        `- H5: ${result.statistics.h5Count}`,
        `- H6: ${result.statistics.h6Count}`,
        ``,
        result.errors.length > 0 ? `SEO Issues (${result.errors.length}):` : "No SEO Issues Found",
        ...result.errors.map(e => `- ${e.message}`),
        ``,
        `Heading Structure:`,
        ...result.headings.map(h => {
          const indent = "  ".repeat(h.level - 1);
          return `${indent}H${h.level}: ${h.text || "(empty)"}`;
        }),
      ].join('\n');
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `Analysis summary copied as ${format} text`,
      });
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Copied to clipboard",
          description: `Analysis summary copied as ${format} text`,
        });
      } catch {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-export-menu"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => exportToJSON(true)}>
            <FileJson className="mr-2 h-4 w-4" />
            JSON (Full Data)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToJSON(false)}>
            <FileJson className="mr-2 h-4 w-4" />
            JSON (Basic)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => exportToCSV(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV (Full Report)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToCSV(false)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV (Headings Only)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel Compatible
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToMarkdown}>
            <FileText className="mr-2 h-4 w-4" />
            Markdown Report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            data-testid="button-copy-menu"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Copy Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => copyToClipboard('plain')}>
            <FileText className="mr-2 h-4 w-4" />
            Plain Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyToClipboard('markdown')}>
            <FileText className="mr-2 h-4 w-4" />
            Markdown
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}