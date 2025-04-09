import { IsNotEmpty, IsString, IsDateString, IsOptional, IsMongoId } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @IsNotEmpty()
  @IsMongoId()
  dentist: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsNotEmpty()
  @IsString()
  service: string;

  @IsOptional()
  @IsString()
  notes?: string;
}