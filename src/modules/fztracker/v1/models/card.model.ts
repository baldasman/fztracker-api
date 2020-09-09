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
  static STATE_ACTIVE = 'ACTIVE';
  static STATE_INACTIVE = 'INACTIVE';

  @IsNotEmpty() id: string;
  @IsNotEmpty() state: string;
  
  cardNumber: string;
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

export class CardImportModel {
  id: string;
  cardNumber: string;
  state: string;
  cardType: string;
}

export class ImportCardRequest {
  @IsNotEmpty() file: string;
}