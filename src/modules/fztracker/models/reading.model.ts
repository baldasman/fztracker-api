import { IsNotEmpty } from 'class-validator';
import * as uuidv4 from 'uuid/v4'; // random ids

export class ReadingModel {
  uid: string;
  readingDate: Date;

  @IsNotEmpty() location: string;
  @IsNotEmpty() sensor: string;

  cardId: string;
  cardNumber: string;
  movementId: string;

  constructor() {
    this.uid = uuidv4();
    this.readingDate = new Date();
  }
}
