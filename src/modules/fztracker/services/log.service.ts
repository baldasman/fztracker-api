import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogModel } from '../models/log.model';



@Injectable()
export class LogService {
  constructor(
      @InjectModel('Log') private readonly logModel: Model<LogModel>,
      private readonly logger: Logger) {
    this.logger.setContext(LogService.name);
  }

  async find(filter: any): Promise<[LogModel]> {
    return this.logModel.find(filter).exec();
  }

  async findOne(filter: object): Promise<LogModel> {
    return this.logModel.findOne(filter).exec();
  }

  async add(data: LogModel): Promise<LogModel> {
    const log = await this.logModel(data);
    return log.save();
  }
}
