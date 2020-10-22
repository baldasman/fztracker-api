import { Schema } from 'mongoose';

export const ReadingSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  cardId: { type: String, required: true },
  readingDate: { type: Date, required: true, default: Date.now },
  location: {
    type: String,
    required: true,
  },
  sensor: {
    type: String,
    required: true,
  },
  cardNumber: { type: String },
  movementId: { type: String }
});

ReadingSchema.index({ readingDate: -1, cardId: 1 });