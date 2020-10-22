import * as uuidv4 from 'uuid/v4'; // random ids


export class LogModel {
  uid: string;
  logDate: Date;
  action: string;
  obs: string;
  entitySerial: string;
  entityType: string;
  cardId: string;
  cardNumber: string;
  userId: string;

  static ACTION_CREATED = 'CREATED';
  static ACTION_EDITED = 'EDITED';
  static ACTION_CANCELED = 'CANCELED';
  static ACTION_DELETED = 'DELETED';
  static ACTION_ASSIGNED = 'ASSIGNED';
  static ACTION_RELEASED = 'RELEASED';

  constructor() {
    this.uid = uuidv4();
  }
}
