import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

// Keep in sync with frontend/src/data/site.ts
export const SERVICES = [
  'Custom Web Application',
  'Mobile App (Flutter)',
  'AI / Machine Learning',
  'Automation (n8n)',
  'Business Logic & APIs',
  'E-commerce Store',
  'Project Consulting',
  'Other',
];

export const BUDGETS = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $15,000',
  '$15,000 - $50,000',
  '$50,000+',
];

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string;

  @IsIn(SERVICES)
  service: string;

  @IsIn(BUDGETS)
  budget: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  timeline?: string;

  @IsString()
  @Length(10, 5000)
  message: string;
}
