import { Schema } from 'mongoose';

export const AuthSchema = new Schema({
  authId: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  activationToken: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    required: false,
    default: false
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  isApi: {
    type: Boolean,
    required: false,
    default: false
  },
  numberOfLogins: {
    type: Number,
    required: true
  },
  confirmationCode: {
    type: String,
    required: false
  },
  confirmationCodeCreatedAt: {
    type: Number,
    required: false
  },
  createdAt: {
    type: Number,
    required: true
  },
  deactivatedAt: {
    type: Number,
    required: false
  },
  deletedAt: {
    type: Number,
    required: false
  }
});
