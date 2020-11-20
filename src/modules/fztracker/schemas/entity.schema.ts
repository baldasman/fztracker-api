import { Schema } from 'mongoose';
import { EntityResource } from '../models/entity.model';

export const EntitySchema = new Schema({
  permanent: {
    serial: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    class: { type: String },
    brand: { type: String },
    model: { type: String }
  },
  nopermanent: {
    location: { type: String },
    rank: { type: String },
    unit: { type: String },
    numKm: { type: Number },
    numShots: { type: Number }
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
  lastMovementDate: { type: Date, default: Date.now },
  cardId: { type: String },
  cardNumber: { type: String },
  resources: [{serial: String, type: String}]
});

EntitySchema.index({ 'permanent.serial': 1, cardId: 1, cardNumber: true });
