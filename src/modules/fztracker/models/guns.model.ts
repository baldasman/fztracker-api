import * as uuidv4 from 'uuid/v4'; // random ids

export class GunsModel {
  ArmeiroId: string;
  place: string;
  lastChangeDate: Date;
  state: string;  
  guns: [{}];
  entitySerial: string;
  entitydesc: string;





  constructor() {
    this.ArmeiroId = uuidv4();
  }
}
