import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum
} from 'class-validator';
import { UserRole } from '../models/userModel';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(8)
  passwordConfirm!: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // use never for protect user send password through route
  @IsOptional()
  password?: never;

  @IsOptional()
  passwordConfirm?: never;
}
