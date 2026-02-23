import type { PAAQuestion, RelatedSearch } from "@shared/schema";

const API_BASE_URL = "https://api.dataforseo.com/v3";

function getDataForSeoCredentials(): { login: string; password: string } {
  // Prefer API_* keys from global env; fall back to legacy names.
  const login = process.env.DATAFORSEO_API_LOGIN || process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_API_PASSWORD || process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error("DataForSEO credentials not configured");
  }

  return { login, password };
}

interface DataForSEOResponse {
  status_code: number;
  status_message: string;
  tasks?: Array<{
    id: string;
    status_code: number;
    status_message: string;
    result?: Array<{
      keyword: string;
      items?: Array<{
        type: string;
        title?: string;
        items?: Array<any> | string[];
        expanded_element?: Array<{
          description?: string;
        }>;
      }>;
    }>;
  }>;
}

export async function searchDataForSEO(keyword: string): Promise<{
  paaQuestions: PAAQuestion[];
  relatedSearches: RelatedSearch[];
}> {
  const { login, password } = getDataForSeoCredentials();
  const auth = Buffer.from(`${login}:${password}`).toString('base64');

  const requestBody = [
    {
      keyword: keyword,
      location_code: 2840, // United States
      language_code: "en",
      device: "desktop",
      os: "windows",
    }
  ];

  try {
    const response = await fetch(`${API_BASE_URL}/serp/google/organic/live/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data: DataForSEOResponse;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("Invalid response format from DataForSEO");
    }

    if (!response.ok) {
      const message = data?.status_message || `HTTP ${response.status}`;
      throw new Error(`DataForSEO request failed: ${message}`);
    }

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO error: ${data.status_message}`);
    }

    const task = data.tasks?.[0];
    if (!task) {
      throw new Error("Invalid response from DataForSEO: missing task");
    }

    if (task.status_code !== 20000) {
      throw new Error(`DataForSEO task error: ${task.status_message}`);
    }

    const paaQuestions: PAAQuestion[] = [];
    const relatedSearches: RelatedSearch[] = [];

    if (data.tasks && data.tasks[0]?.result) {
      const result = data.tasks[0].result[0];
      
      if (result?.items) {
        for (const item of result.items) {
          // Extract People Also Ask questions
          if (item.type === 'people_also_ask' && item.items) {
            for (const paaItem of item.items) {
              if (paaItem.type === 'people_also_ask_element' && paaItem.title) {
                paaQuestions.push({
                  question: paaItem.title,
                  answer: paaItem.expanded_element?.[0]?.description,
                });
              }
            }
          }

          // Extract Related Searches
          if (item.type === 'related_searches' && item.items) {
            for (const searchTerm of item.items) {
              if (typeof searchTerm === 'string') {
                relatedSearches.push({
                  query: searchTerm,
                });
              }
            }
          }
        }
      }
    }

    return {
      paaQuestions,
      relatedSearches,
    };
  } catch (error) {
    console.error('DataForSEO API error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch search data from DataForSEO',
    );
  }
}
