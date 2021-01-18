import { Schema } from 'mongoose';

export const ReadingSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  cardNumber: { type: String, required: true },
  readingDate: { type: Date, required: true, default: Date.now },
  location: {
    type: String,
    required: true,
  },
  sensor: {
    type: String,
    required: true,
  },
  manual: { type: Boolean, default: true },
  cardId: { type: String, required: false },
  movementId: { type: String }
});

ReadingSchema.index({ readingDate: -1, cardId: 1 });