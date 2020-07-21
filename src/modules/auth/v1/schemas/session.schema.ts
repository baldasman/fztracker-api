import { Schema } from 'mongoose';

export const SessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true
  },
  authId: {
    type: String,
    required: true
  },
  sessionType: {
    type: String,
    required: true
  },
  lastLoginFrom: {
    type: String,
    required: true
  },
  lastLoginDate: {
    type: Number,
    required: true
  },
  lastToken: {
    type: String,
    required: true
  },
  context: {
    type: Object,
    required: true
  },
  expiresAt: {
    type: Number
  },
  description: {
    type: String
  }
});
