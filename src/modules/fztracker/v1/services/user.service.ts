import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuthModel } from '../../../core/models/auth.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('Auth') private readonly authModel: Model<AuthModel>,
    private readonly logger: Logger
  ) {
  }

  async get(authId) {
    return this.authModel.find({authId: authId}).exec();
  }

  async getAll(filter) {
    return this.authModel.find(filter).exec();
  }
  
  async update(authId, changes) {
    return this.authModel.updateOne({authId: authId}, changes).exec();
  }
}
