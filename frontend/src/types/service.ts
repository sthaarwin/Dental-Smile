// Service categories enum matching the backend
export enum ServiceCategory {
  GENERAL = 'general',
  COSMETIC = 'cosmetic',
  ORTHODONTIC = 'orthodontic',
  SURGICAL = 'surgical',
  PREVENTIVE = 'preventive',
  PEDIATRIC = 'pediatric',
}

// Base interface for dental service
export interface DentalService {
  _id?: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  category?: ServiceCategory;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Interface for creating a new service
export interface CreateServiceRequest {
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
  category?: ServiceCategory;
}

// Interface for updating an existing service
export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  imageUrl?: string;
  isActive?: boolean;
  category?: ServiceCategory;
}

// Response interface for paginated services
export interface PaginatedServicesResponse {
  data: DentalService[];
  total: number;
  page: number;
  totalPages: number;
}

// Interface for bulk update operations
export interface BulkServiceUpdate {
  id: string;
  data: UpdateServiceRequest;
}