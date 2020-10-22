import { Schema } from 'mongoose';

export const MovementSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  movementDate: { type: Date, required: true, default: Date.now },
  location: {
    type: String,
    required: true
  },
  sensor: {
    type: String,
    required: true
  },
  inOut: {
    type: Boolean,
    required: true,
    default: true
  },
  manual: {
    type: Boolean,
    required: true,
    default: false

  },
  entitySerial: { type: String },
  entityName: { type: String },
  entityType: { type: String },
  cardId: { type: String },
  cardNumber: { type: String },
  relatedMovements: [{ type: String, required: true }]
});

MovementSchema.index({ movementDate: -1, cardNumber: 1 });
