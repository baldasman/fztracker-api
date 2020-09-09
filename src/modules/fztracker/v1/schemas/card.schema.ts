import { Schema } from 'mongoose';

export const CardSchema = new Schema({
  id: {type: String, required: true},
  cardNumber: {type: String, required: false},
  state: {type: String, required: true},
  lastChangeDate: {type: Date, default: Date.now},
  entitySerial: {type: String},
  entityType: {type: String},
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
  readings: [{
    uid: {
      type: String,
      required: true,
    },
    readingDate: {type: Date, required: true, default: Date.now},
    location: {
      type: String,
      required: true,
    },
    sensor: {
      type: String,
      required: true,
    },
    movementId: {type: String}
  }]
});

CardSchema.index({id: 1}, {unique: true});