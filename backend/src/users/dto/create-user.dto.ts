import { IsString, IsPhoneNumber, IsEmail, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Numéro de téléphone au format international',
    example: '+241062345678'
  })
  @IsString()
  @IsPhoneNumber('GA', { message: 'Le numéro de téléphone doit être au format gabonais (+241...)' })
  phone: string;

  @ApiProperty({
    description: 'Nom complet de l\'utilisateur',
    example: 'Jean Nguema'
  })
  @IsString()
  @Length(2, 100, { message: 'Le nom doit contenir entre 2 et 100 caractères' })
  name: string;

  @ApiPropertyOptional({
    description: 'Adresse email (optionnelle)',
    example: 'jean.nguema@gmail.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email?: string;
} 
