import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum } from 'class-validator';

// Define service categories
export enum ServiceCategory {
  GENERAL = 'general',
  COSMETIC = 'cosmetic',
  ORTHODONTIC = 'orthodontic',
  SURGICAL = 'surgical',
  PREVENTIVE = 'preventive',
  PEDIATRIC = 'pediatric',
}

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(5)
  duration: number; 

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory = ServiceCategory.GENERAL;
}