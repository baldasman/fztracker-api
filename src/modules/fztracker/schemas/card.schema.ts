import { Schema } from 'mongoose';



export const CardSchema = new Schema({
  uid: { type: String, required: true, unique: true },
  cardNumber: { type: String, required: false },
  state: { type: String, required: true },
  lastChangeDate: { type: Date, default: Date.now },
  lastMovementDate: { type: Date, default: Date.now },
  entitySerial: { type: String },
  entityType: { type: String },
  entityDesc: { type: String }
});


CardSchema.index({ cardNumber: 1 });