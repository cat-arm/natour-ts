import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

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

export class ResetPasswordDto {
  @IsString()
  password!: string;

  @MinLength(8)
  passwordConfirm!: string;
}
