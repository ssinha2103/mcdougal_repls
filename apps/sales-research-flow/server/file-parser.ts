import * as XLSX from "xlsx";

export interface ParsedDomain {
  companyName: string;
  webAddress: string;
  category: "MA" | "National";
}

export class FileParser {
  /**
   * Parse CSV or Excel file and extract domain data
   */
  static parseFile(buffer: Buffer, filename: string): ParsedDomain[] {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
    
    if (data.length < 2) {
      throw new Error("File must contain header row and at least one data row");
    }

    const headers = data[0] as string[];
    const rows = data.slice(1) as any[][];

    // Find column indices (flexible header matching)
    const companyIdx = this.findColumnIndex(headers, ["company", "company name", "firm", "name"]);
    const domainIdx = this.findColumnIndex(headers, ["domain", "website", "web address", "url", "site"]);
    const categoryIdx = this.findColumnIndex(headers, ["category", "type", "region"]);

    if (companyIdx === -1 || domainIdx === -1) {
      throw new Error("File must contain 'Company Name' and 'Domain/Website' columns");
    }

    const domains: ParsedDomain[] = [];

    for (const row of rows) {
      const companyName = row[companyIdx]?.toString().trim();
      const webAddress = row[domainIdx]?.toString().trim();
      const category = categoryIdx !== -1 ? row[categoryIdx]?.toString().trim() : "";

      if (!companyName || !webAddress) continue;

      domains.push({
        companyName,
        webAddress,
        category: category.toLowerCase().includes("national") ? "National" : "MA",
      });
    }

    if (domains.length === 0) {
      throw new Error("No valid domain data found in file");
    }

    return domains;
  }

  /**
   * Find column index by matching header names (case-insensitive)
   */
  private static findColumnIndex(headers: string[], searchTerms: string[]): number {
    return headers.findIndex((header) =>
      searchTerms.some((term) =>
        header.toLowerCase().includes(term.toLowerCase())
      )
    );
  }
}
