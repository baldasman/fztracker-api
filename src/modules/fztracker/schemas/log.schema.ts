import { Schema } from 'mongoose';

export const LogSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  logDate: { type: Date, required: true, default: Date.now },
  action: { type: String, required: true },
  obs: { type: String },
  userId: { type: String },
  entitySerial: { type: String },
  entityType: { type: String },
  cardId: { type: String },
  cardNumber: { type: String }
});

LogSchema.index({ logDate: -1 });