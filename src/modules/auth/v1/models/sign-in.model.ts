import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInModel {
  @IsNotEmpty() authId: string;
  @IsNotEmpty() password: string;
  @IsNotEmpty() sessionType: string;
  context?: string;
}