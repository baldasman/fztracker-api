import { Schema } from 'mongoose';

export const EntitySchema = new Schema({
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
  unit: {type:String},
  email:{type:String} ,
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
  resources: [{}]
});

EntitySchema.index({ 'permanent.serial': 1, cardId: 1, cardNumber: true });
