import { IsNotEmpty } from 'class-validator';

export class GunsModel {
  @IsNotEmpty() ArmeiroId: string;
  place: string;
  
  lastChangeDate: Date;
  state: string;  
  guns: unknown; // [{}]
  entitySerial: string;
  entitydesc: string;





  constructor() {

  }
}
