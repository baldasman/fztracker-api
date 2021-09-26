import { IsNotEmpty } from 'class-validator';
import * as uuidv4 from 'uuid/v4'; // random ids

export class EntityResource {
  static TYPE_CARMIL = 'Viatura Militar';
  static TYPE_CARCIV = 'Viatura Civil';
  static TYPE_MILITARY = 'Militar';
  static TYPE_CIVILIAN = 'Civil';
  static TYPE_SCOUT = 'Aluno';
  static TYPE_VISITOR = 'Visita';

  serial: string;
  type: string;

  constructor(serial?: string, type?: string) {
    this.serial = serial;
    this.type = type;
  }
}

export class Vehicle extends EntityResource {
  plate: string;
  brand: string;
  model: string;
  color: string;

  constructor(plate: string, brand?: string, model?: string, color?: string) {
    super(plate.replace(/-/g, ''), 'VEHICLE');

    this.plate = plate;
    this.brand = brand;
    this.model = model;
    this.color = color;
  }

}

export class EntityLogModel {
  uid: string;
  logDate: Date;
  action: string;
  userId: string;
  obs: string;

  static ACTION_EDIT = 'edit';
  static ACTION_ADD_RESOURCE = 'add_resource';
  static ACTION_REMOVE_RESOURCE = 'remove_resource';

  constructor() {
    this.uid = uuidv4();
  }
}

export class EntityModel {
  static STATE_ACTIVE = 'ACTIVE';
  static STATE_INACTIVE = 'INACTIVE';

  serial: string;
  type: string;
  name: string;
  unit: string;
  email: string;
  state: string;
  inOut: boolean;
  lastMovementDate: Date;
  cardId: string;
  cardIdShort: string;
  lastlocal:string;
  cardNumber: string;
  resources: EntityResource[];

  constructor() {
    this.inOut = true;
    this.lastMovementDate = new Date();
  }
}

export class EntityImportModel {
  serial: string;
  rank: string;
  class: string;
  name: string;
  location: string;
  unit: string;
  type: string;
  resource1: string;
  resource2: string;
  resource3: string;
  resource4: string;

}

export class ImportEntityRequest {
  @IsNotEmpty() file: string;
}