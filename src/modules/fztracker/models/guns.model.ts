import { IsNotEmpty } from 'class-validator';

export class GunsModel {
  @IsNotEmpty() ArmeiroId: string;
  @IsNotEmpty() place: string;
  
  lastChangeDate: Date;
  state: string;  
  guns: [{}];
  entitySerial: string;
  entitydesc: string;





  constructor() {

  }
}
