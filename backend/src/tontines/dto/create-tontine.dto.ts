// backend/src/tontines/dto/create-tontine.dto.ts
import { IsString, IsNumber, IsEnum, IsDate, IsBoolean, IsOptional, Min, Max, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TontineRulesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyAmount?: number;

  @IsNumber()
  @Min(0)
  @Max(30)
  gracePeriodDays: number;

  @IsBoolean()
  allowEarlyWithdrawal: boolean;

  @IsEnum(['random', 'manual', 'auction'])
  orderDeterminationMethod: 'random' | 'manual' | 'auction';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minimumReputationScore?: number;
}

export class CreateTontineDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(10, 500)
  description: string;

  @IsString()
  @Length(5, 200)
  objective: string;

  @IsNumber()
  @Min(5000)
  @Max(1000000)
  contributionAmount: number;

  @IsEnum(['weekly', 'biweekly', 'monthly'])
  frequency: 'weekly' | 'biweekly' | 'monthly';

  @IsNumber()
  @Min(3)
  @Max(50)
  maxParticipants: number;

  @IsNumber()
  @Min(3)
  @Max(50)
  minParticipants: number;

  @IsString()
  enrollmentDeadline: string; // ISO string from frontend

  @IsString()
  plannedStartDate: string; // ISO string from frontend

  @ValidateNested()
  @Type(() => TontineRulesDto)
  rules: TontineRulesDto;
} 
