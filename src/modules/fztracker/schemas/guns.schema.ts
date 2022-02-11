import { Schema } from 'mongoose';



export const GunsSchema = new Schema({
  ArmeiroId: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  guns: [{}],
  lastChangeDate: { type: Date, default: Date.now },
  entitySerial: { type: String },
  entityDesc: { type: String }
});


GunsSchema.index({ place: 1 });