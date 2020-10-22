import { IsNotEmpty } from 'class-validator';
import * as uuidv4 from 'uuid/v4'; // random ids

export class CardReadingModel {
  uid: string;
  readingDate: Date;

  @IsNotEmpty() location: string;
  @IsNotEmpty() sensor: string;

  movementId: string;

  constructor() {
    this.uid = uuidv4();
    this.readingDate = new Date();
  }
}

export class CardModel {
  static STATE_ACTIVE = 'ACTIVE';
  static STATE_INACTIVE = 'INACTIVE';

  @IsNotEmpty() uid: string;
  @IsNotEmpty() state: string;
  
  cardNumber: string;
  lastChangeDate: Date;
  entitySerial: string;
  entityType: string;
  entityDesc: string;

  constructor() {

  }
}

export class CardImportModel {
  uid: string;
  cardNumber: string;
  state: string;
  cardType: string;
}

export class ImportCardRequest {
  @IsNotEmpty() file: string;
}
