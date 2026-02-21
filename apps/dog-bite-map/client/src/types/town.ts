export interface ContactInfo {
  name: string;
  phone: string;
}

export interface PoliceContact {
  phone: string;
}

export interface ClerkContact {
  phone: string;
}

export interface TownData {
  id: string;
  name: string;
  center: [number, number]; // [longitude, latitude]
  animalControl: ContactInfo;
  police: PoliceContact;
  clerk: ClerkContact;
}
