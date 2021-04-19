import * as uuidv4 from 'uuid/v4'; // random ids

export class MovementModel {
  uid: string;
  movementDate: Date;
  location: string;
  sensor: string;
  inOut: boolean;
  manual: boolean;
  entitySerial: string;
  entityName: string;
  entityType: string;
  cardId: string;
  cardIdShort: string;
  cardNumber: string;
  plate: string;
  relatedMovements: string[];

  constructor() {
    this.uid = uuidv4();
  }
}
