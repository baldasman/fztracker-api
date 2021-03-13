import { IsNotEmpty } from 'class-validator';

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
  lastMovementDate:Date;

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
