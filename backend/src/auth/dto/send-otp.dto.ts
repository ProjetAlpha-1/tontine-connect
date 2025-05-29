import { IsString, IsPhoneNumber, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Numéro de téléphone au format international gabonais',
    example: '+241062345678'
  })
  @IsString()
  @IsPhoneNumber('GA', { message: 'Le numéro doit être au format gabonais (+241...)' })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+241062345678'
  })
  @IsString()
  @IsPhoneNumber('GA')
  phone: string;

  @ApiProperty({
    description: 'Code OTP reçu par SMS',
    example: '123456'
  })
  @IsString()
  @Length(6, 6, { message: 'Le code OTP doit contenir exactement 6 chiffres' })
  @Matches(/^\d{6}$/, { message: 'Le code OTP doit contenir uniquement des chiffres' })
  otp: string;

  @ApiProperty({
    description: 'Nom complet (pour nouveaux utilisateurs)',
    example: 'Jean Nguema',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;
}