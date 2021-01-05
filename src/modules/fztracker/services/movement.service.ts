import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MovementModel } from '../models/movement.model';

@Injectable()
export class MovementService {
  constructor(
    @InjectModel('Movement') private readonly cardModel: Model<MovementModel>,
    private readonly logger: Logger
  ) {
    this.logger.setContext(MovementService.name);
  }

  async find(filter: any): Promise<[MovementModel]> {
    return this.cardModel.find(filter).exec();
  }

  async findOne(filter: object): Promise<MovementModel> {
    return this.cardModel.findOne(filter).exec();
  }

  async add(data: MovementModel): Promise<MovementModel> {
    const card = await this.cardModel(data);
    return card.save();
  }

  async updateOne(card: MovementModel): Promise<MovementModel> {
    return this.cardModel.updateOne({ cardNumber: card.cardNumber }, card).exec();
  }
}
