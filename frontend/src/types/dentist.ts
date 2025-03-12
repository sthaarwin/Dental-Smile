
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
  availability: string;
  acceptingNewPatients: boolean;
  insuranceAccepted: string[];
}
