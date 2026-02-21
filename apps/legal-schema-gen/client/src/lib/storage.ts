import { LegalServiceData } from "@shared/schema";

export interface SavedSchema {
  id: string;
  name: string;
  data: LegalServiceData;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "legal_schemas";
const DRAFT_KEY = "legal_schema_draft";

export function getSavedSchemas(): SavedSchema[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load saved schemas:", error);
    return [];
  }
}

export function saveSchema(data: LegalServiceData, name: string, id?: string): SavedSchema {
  const schemas = getSavedSchemas();
  const now = new Date().toISOString();
  
  const existingIndex = id ? schemas.findIndex(s => s.id === id) : -1;
  
  const schema: SavedSchema = {
    id: id || `schema_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    data,
    createdAt: existingIndex >= 0 ? schemas[existingIndex].createdAt : now,
    updatedAt: now,
  };
  
  if (existingIndex >= 0) {
    schemas[existingIndex] = schema;
  } else {
    schemas.unshift(schema);
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
    return schema;
  } catch (error) {
    console.error("Failed to save schema:", error);
    throw new Error("Failed to save schema. Storage may be full.");
  }
}

export function deleteSchema(id: string): void {
  const schemas = getSavedSchemas().filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
  } catch (error) {
    console.error("Failed to delete schema:", error);
  }
}

export function saveDraft(data: Partial<LegalServiceData>): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
}

export function loadDraft(): Partial<LegalServiceData> | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return null;
    
    const { data, timestamp } = JSON.parse(stored);
    const age = Date.now() - new Date(timestamp).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (age > maxAge) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}
