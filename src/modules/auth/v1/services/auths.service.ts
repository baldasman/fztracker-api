import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash } from 'bcrypt';

import { AuthModel } from '../../../core/models/auth.model';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel('Auth') private readonly authModel: Model<AuthModel>,
    private readonly logger: Logger
  ) {
  }

  async createAuth(data: AuthModel): Promise<AuthModel> {
    this.logger.setContext(AuthsService.name);

    if (data.password) {
      let hashedPassword;
      try {
        hashedPassword = await hash(data.password, 10);
        data.password = hashedPassword;
      } catch (e) {
        this.logger.error('Error generating hash');
        return Promise.reject('Error generating hash');
      }
    }

    const auth = await this.authModel(data);
    return auth.save();
  }

  async findAuth(body) {
    return this.authModel.findOne(body).exec();
  }

  async updateAuth(body: { query: object; update: object }) {
    if (body.update['password']) {
      let hashedPassword;
      try {
        hashedPassword = await hash(body.update['password'], 10);
        body.update['password'] = hashedPassword;
      } catch (e) {
        this.logger.error('Error generating hash');
        return Promise.reject('Error generating hash');
      }
    }

    return this.authModel.updateOne(body.query, body.update).exec();
  }

  async getAll(filter) {
    return this.authModel.find(filter).exec();
  }
}
