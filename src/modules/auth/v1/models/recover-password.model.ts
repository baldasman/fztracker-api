import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecoverPasswordModel {
  @IsEmail() @IsNotEmpty() authId: string;
}