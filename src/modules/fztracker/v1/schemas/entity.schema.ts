import { Schema } from 'mongoose';

export const EntitySchema = new Schema({
  permanent: {
    serial: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    class: {type: String},
    brand: {type: String},
    model: {type: String}
  },
  nopermanent: {
    location: {type: String},
    rank: {type: String},
    unit: {type: String},
    numKm: {type: Number},
    numShots: {type: Number}
  },
  state: {
    type: String,
    required: true,
  },
  inOut: {
    type: Boolean,
    required: true,
    default: true,
  },
  lastMovementDate: {type: Date, default: Date.now},
  cardId: {type: String},
  cardNumber: {type: String},
  movements: [{
    id: {
      type: String,
      required: true,
    },
    movementDate: {type: Date, required: true, default: Date.now},
    location: {
      type: String,
      required: true,
    },
    sensor: {
      type: String,
      required: true,
    },
    cardId: {type: String, required: true},
    inOut: {
      type: Boolean,
      required: true,
      default: true,
    },
    manual: {
      type: Boolean,
      default: false,
    },
    relatedMovements: [{type: String, required: true}]
  }],
  resources: [{
    serial: {type: String},
    type: {type: String}
  }],
  log: [{
    uid: {
      type: String,
      required: true,
    },
    logDate: {type: Date, required: true, default: Date.now},
    action: {type: String, required: true},
    userId: {type: String},
    obs: {type: String}
  }],
});

EntitySchema.index({'permanent.serial': 1}, {unique: true});
EntitySchema.index({cardId: 1});
