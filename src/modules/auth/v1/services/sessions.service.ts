import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


import { SessionModel } from '../models/session.model';

@Injectable()
export class SessionsService {

  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<SessionModel>
  ) {
  }

  async createSession(data: SessionModel): Promise<SessionModel> {
    const session = await this.sessionModel(data);
    return session.save();
  }

  async findSession(body): Promise<SessionModel> {
    return this.sessionModel.findOne(body).exec();
  }

  async findSessions(body): Promise<SessionModel[]> {
    return this.sessionModel.find(body).exec();
  }

  async updateSession(body: { query: object; update: object }) {
    return this.sessionModel.updateOne(body.query, body.update).exec();
  }

  async deleteSession(body) {
    return this.sessionModel.deleteOne(body).exec();
  }

  async pingMongo(): Promise<SessionModel> {
    return this.sessionModel.findById('sessionId').exec();
  }
}
