import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignUpModel {
  @IsNotEmpty() @IsEmail() authId: string;
  password?: string;
  @IsNotEmpty() name: string;
}