import { apiRequest } from "@/lib/queryClient";

export interface AnalysisJob {
  id: number;
  urls: string[];
  status: string;
  results?: any;
  progress?: number;
  currentStep?: string;
  createdAt: string;
  completedAt?: string;
  metrics?: SeoMetrics[];
}

export interface SeoMetrics {
  id: number;
  url: string;
  domain: string;
  indexedPages?: number;
  referringDomains?: number;
  backlinks?: number;
  organicKeywords?: number;
  organicTraffic?: number;
  trafficCost?: string;
  top100Keywords?: number;
  keywordPositions?: string;
  competitorGap?: number;
  pageSpeed?: string;
  // E-E-A-T signals
  hasAuthorBox?: boolean;
  hasLinkedAuthor?: boolean;
  hasStructuredData?: boolean;
  structuredContentScore?: number;
  experienceSignals?: number;
  originalMediaCount?: number;
  trustSignalsScore?: number;
  googleReviewsCount?: number;
  googleRating?: string;
  // YouTube Analytics
  youtubeChannelUrl?: string;
  youtubeSubscribers?: number;
  youtubeTotalViews?: number;
  youtubeVideoCount?: number;
  youtubePostingFrequency?: string;
  youtubeEngagementRate?: string;
  youtubeChannelAge?: number;
  // Social Media Analytics
  socialMediaClicks?: any;
  socialMediaPresence?: string[];
  socialMediaAnalytics?: any;
  // Technology Stack
  technologies?: any;
  securityScore?: number;
  mobileOptimization?: boolean;
  // Competitive Intelligence
  competitiveStrength?: string;
  contentGaps?: string[];
  // New DataForSEO calculated metrics
  avgCPC?: string;
  top10Coverage?: string;
  top3Keywords?: number;
  top3Percentage?: string;
  visibilityScore?: string;
  newKeywords?: number;
  improvedKeywords?: number;
  declinedKeywords?: number;
  lostKeywords?: number;
  analysisJobId: number;
  createdAt: string;
}

export async function startAnalysis(urls: string[], socialLinks?: { [domain: string]: { googleProfile?: string; reviewsCount?: string; rating?: string; youtube?: string; facebook?: string; instagram?: string; twitter?: string; linkedin?: string } }): Promise<AnalysisJob> {
  const response = await apiRequest('POST', '/api/analysis', { urls, socialLinks });
  return response.json();
}

export async function getAnalysisJob(id: number): Promise<AnalysisJob> {
  const response = await apiRequest('GET', `/api/analysis/${id}`);
  return response.json();
}

export async function exportAnalysis(id: number): Promise<Blob> {
  const response = await apiRequest('GET', `/api/analysis/${id}/export`);
  return response.blob();
}

export async function exportAnalysisPDF(id: number): Promise<Blob> {
  const response = await apiRequest('POST', `/api/analysis/${id}/export-pdf`);
  return response.blob();
}
