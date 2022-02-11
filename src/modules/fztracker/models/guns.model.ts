import * as uuidv4 from 'uuid/v4'; // random ids

export class GunsModel {
  uid: string;
  place: string;
  lastChangeDate: Date;
  state: string;  
  guns: [{}];
  entitySerial: string;
  entityName: string;





  constructor() {
    this.uid = uuidv4();
  }
}
