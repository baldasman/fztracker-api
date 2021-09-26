import * as uuidv4 from 'uuid/v4'; // random ids

export class LogModel {
  uid: string;
  logDate: Date;
  action: string;
  obs: string;
  entitySerial: string;
  entityType: string;
  cardId: string;
  cardIdShort: string;
  lastlocal: string;
  cardNumber: string;
  userId: string;

  static ACTION_CARD_CREATED = 'CARD_CREATED';
  static ACTION_CARD_EDITED = 'CARD_EDITED';
  static ACTION_CARD_CANCELED = 'CARD_CANCELED';
  static ACTION_CARD_DELETED = 'CARD_DELETED';
  static ACTION_CARD_ASSIGNED = 'CARD_ASSIGNED';
  static ACTION_CARD_RELEASED = 'CARD_RELEASED';

  constructor() {
    this.uid = uuidv4();
  }
}
