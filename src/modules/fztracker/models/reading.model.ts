import { IsNotEmpty } from 'class-validator';
import * as uuidv4 from 'uuid/v4'; // random ids

export class ReadingModel {
  uid: string;
  readingDate: Date;

  @IsNotEmpty() location: string;
  @IsNotEmpty() sensor: string;

  cardNumber: string;
  movementId: string;
  manual?: boolean;
  cardId?: string;
  cardIdShort?: string;
  lastlocal?: string;

  constructor() {
    this.uid = uuidv4();
    this.readingDate = new Date();
  }
}
