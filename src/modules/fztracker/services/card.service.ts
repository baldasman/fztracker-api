import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CardModel } from '../models/card.model';


@Injectable()
export class CardService {
  constructor(
      @InjectModel('Card') private readonly cardModel: Model<CardModel>,
      private readonly logger: Logger) {
    this.logger.setContext(CardService.name);
  }

  async find(filter: any): Promise<[CardModel]> {
    return this.cardModel.find(filter).exec();
  }

  async findOne(filter: object): Promise<CardModel> {

 



    return this.cardModel.findOne(filter).exec();
  }

  async add(data: CardModel): Promise<CardModel> {
    const card = await this.cardModel(data);
    return card.save();
  }

  async updateOne(card: CardModel): Promise<CardModel> {
    return this.cardModel.updateOne({cardNumber: card.cardNumber}, card).exec();
  }
}
