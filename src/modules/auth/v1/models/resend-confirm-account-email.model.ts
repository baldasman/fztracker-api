import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendConfirmAccountEmailModel {
  @IsEmail() @IsNotEmpty() authId: string;
}