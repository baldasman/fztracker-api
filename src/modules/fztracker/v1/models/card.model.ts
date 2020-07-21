import { IsNotEmpty } from 'class-validator';
import * as uuidv4 from 'uuid/v4'; // random ids


export class CardLogModel {
  uid: string;
  logDate: Date;
  action: string;
  userId: string;
  obs: string;

  static ACTION_CREATED = 'created';
  static ACTION_EDITED = 'edited';
  static ACTION_CANCELED = 'canceled';
  static ACTION_DELETED = 'deleted';

  constructor() {
    this.uid = uuidv4();
  }
}

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
  @IsNotEmpty() id: string;
  @IsNotEmpty() state: string;
  
  cardNumber: number;
  lastChangeDate: Date;
  entitySerial: string;
  entityType: string;

  log: CardLogModel[];
  readings: CardReadingModel[];

  constructor() {
    this.log = [];
    this.readings = [];
  }
}