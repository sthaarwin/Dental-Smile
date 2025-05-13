export interface BusinessHour {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface BusinessHours {
  monday: BusinessHour;
  tuesday: BusinessHour;
  wednesday: BusinessHour;
  thursday: BusinessHour;
  friday: BusinessHour;
  saturday: BusinessHour;
  sunday: BusinessHour;
  [key: string]: BusinessHour;
}

export interface Dentist {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  image?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  bio: string;
  education: string[];
  certifications: string[];
  services: string[];
  languages: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  availability: string | BusinessHours;
  acceptingNewPatients: boolean;
  insuranceAccepted: string[];
}
