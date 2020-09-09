import {IsNotEmpty} from 'class-validator';
import * as uuidv4 from 'uuid/v4';  // random ids

export class PermanentModel {
  static TYPE_CARMIL = 'Viatura Militar';
  static TYPE_CARCIV = 'Viatura Civil';
  static TYPE_MILITARY = 'Militar';
  static TYPE_CIVILIAN = 'Civil';
  static TYPE_SCOUT = 'Aluno';
  static TYPE_VISITOR = 'Visita';

  @IsNotEmpty() serial: string;
  @IsNotEmpty() type: string;
  @IsNotEmpty() name: string;

  class: string;
  brand: string;
  model: string;
}

export class EntityResource {
  serial: string;
  type: string;

  constructor(serial?: string, type?: string) {
    this.serial = serial;
    this.type = type;
  }
}

export class NoPermanentModel {
  location: string;
  rank: string;
  unit: string;
  numKm: number;
  numShots: number;
}

export class EntityMovementModel {
  id: string;
  entities: string[];
  movementDate: Date;
  location: string;
  cardNumber: string;
  inOut: boolean;
  sensor: string;
  cardId: string;
  manual: boolean;

  constructor() {
    this.id = uuidv4();
    this.movementDate = new Date();
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

  @IsNotEmpty() permanent: PermanentModel;

  nopermanent: NoPermanentModel;
  state: string;
  inOut: boolean;
  lastMovementDate: Date;
  cardId: string;
  cardNumber: number;
  movements: EntityMovementModel[];
  log: EntityLogModel[];
  resources: EntityResource[];

  constructor() {
    this.permanent = new PermanentModel();
    this.nopermanent = new NoPermanentModel();

    this.inOut = true;
    this.lastMovementDate = new Date();
    this.movements = [];
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