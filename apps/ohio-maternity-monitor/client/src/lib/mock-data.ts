import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  zip: string;
  distance: number;
  lat: number;
  lng: number;
  phone: string;
  quality: {
    cSectionRate: number;
    isBirthingFriendly: boolean;
    maternalMorbidity: number;
    rating: 'Excellent' | 'Good' | 'Fair';
    complicationRate: number;
    earlyElectiveDelivery: number;
  };
  features: string[];
  description?: string;
}

export async function searchHospitals(zip: string, riskLevel: 'low' | 'medium' | 'high', maxDistance: number): Promise<Hospital[]> {
  const response = await fetch(`/api/hospitals/search?zip=${encodeURIComponent(zip)}&riskLevel=${riskLevel}&maxDistance=${maxDistance}`);
  
  if (!response.ok) {
    throw new Error('Failed to search hospitals');
  }
  
  return response.json();
}

export async function getHospitalById(id: string | number): Promise<Hospital | undefined> {
  const response = await fetch(`/api/hospitals/${id}`);
  
  if (response.status === 404) {
    return undefined;
  }
  
  if (!response.ok) {
    throw new Error('Failed to get hospital');
  }
  
  return response.json();
}
