import axios from "axios";
import type { NAPData } from "@shared/schema";

interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
}

export async function searchGooglePlaces(
  firmName: string,
  location: string
): Promise<{ placeId: string; napData: NAPData } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  try {
    const query = `${firmName} ${location}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
    
    const searchResponse = await axios.get(searchUrl, {
      params: {
        input: query,
        inputtype: "textquery",
        fields: "place_id,name",
        key: apiKey,
      },
    });

    if (
      !searchResponse.data.candidates ||
      searchResponse.data.candidates.length === 0
    ) {
      return null;
    }

    const placeId = searchResponse.data.candidates[0].place_id;

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
    const detailsResponse = await axios.get(detailsUrl, {
      params: {
        place_id: placeId,
        fields: "name,formatted_address,formatted_phone_number",
        key: apiKey,
      },
    });

    const result: PlaceSearchResult = detailsResponse.data.result;

    if (!result) {
      return null;
    }

    return {
      placeId,
      napData: {
        name: result.name || "",
        address: result.formatted_address || "",
        phone: result.formatted_phone_number || "",
      },
    };
  } catch (error) {
    console.error("Google Places API error:", error);
    throw new Error("Failed to fetch data from Google Places API");
  }
}
