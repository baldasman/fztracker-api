import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReadingModel } from '../models/reading.model';


@Injectable()
export class ReadingService {
  constructor(
    @InjectModel('Reading') private readonly readingModel: Model<ReadingModel>,
    private readonly logger: Logger) {
    this.logger.setContext(ReadingService.name);
  }

  async find(filter: any): Promise<[ReadingModel]> {
    return this.readingModel.find(filter).exec();
  }

  async findOne(filter: object): Promise<ReadingModel> {
    return this.readingModel.findOne(filter).exec();
  }

  async add(data: ReadingModel): Promise<ReadingModel> {
    const reading = await this.readingModel(data);
    return reading.save();
  }
}
