import { IsString, IsDateString, IsOptional, IsMongoId, IsIn } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsMongoId()
  patient?: string;

  @IsOptional()
  @IsMongoId()
  dentist?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  service?: string;

  @IsOptional()
  @IsString()
  @IsIn(['scheduled', 'completed', 'cancelled', 'no-show'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}