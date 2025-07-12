import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserRole } from '../models/userModel';

export type AuthUserDto = {
  id: string;
  role: UserRole;
};

export class SignupDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @MinLength(8)
  passwordConfirm!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class UpdatePasswordDto {
  @IsString()
  passwordCurrent!: string;

  @MinLength(8)
  password!: string;

  @MinLength(8)
  passwordConfirm!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  password!: string;

  @MinLength(8)
  passwordConfirm!: string;
}
