import { IsNotEmpty } from 'class-validator';

export class ConfirmAccountModel {
  @IsNotEmpty() token: string;
  @IsNotEmpty() confirmationCode: string;
}