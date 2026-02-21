import type { PAAQuestion, RelatedSearch } from "@shared/schema";

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
  throw new Error("DataForSEO credentials not configured");
}

const API_BASE_URL = "https://api.dataforseo.com/v3";

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
  const auth = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');

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

    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
    }

    const data: DataForSEOResponse = await response.json();

    if (data.status_code !== 20000) {
      throw new Error(`DataForSEO error: ${data.status_message}`);
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
    throw new Error('Failed to fetch search data from DataForSEO');
  }
}
