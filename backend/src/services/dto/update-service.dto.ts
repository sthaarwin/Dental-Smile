import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum } from 'class-validator';
import { ServiceCategory } from './create-service.dto';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  duration?: number; // in minutes

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;
}