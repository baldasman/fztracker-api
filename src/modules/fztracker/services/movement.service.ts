import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MovementModel } from '../models/movement.model';

@Injectable()
export class MovementService {
  constructor(
    @InjectModel('Movement') private readonly movementModel: Model<MovementModel>,
    private readonly logger: Logger
  ) {
    this.logger.setContext(MovementService.name);
  }

  async find(filter: any, sort?: any): Promise<[MovementModel]> {
    return this.movementModel.find(filter).sort(sort || {movementDate: -1}).exec();
  }

  async findOne(filter: object): Promise<MovementModel> {
    return this.movementModel.findOne(filter).exec();
  }

  async add(data: MovementModel): Promise<MovementModel> {
    const card = await this.movementModel(data);
    return card.save();
  }

  async updateOne(card: MovementModel): Promise<MovementModel> {
    return this.movementModel.updateOne({ cardNumber: card.cardNumber }, card).exec();
  }

  async findAndCount(filter: object): Promise<number> {
    return this.movementModel.find(filter).count().exec();
  }
}
