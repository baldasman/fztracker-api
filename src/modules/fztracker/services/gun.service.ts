import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GunsModel } from '../models/guns.model';


@Injectable()
export class GunService {
  constructor(
      @InjectModel('Gun') private readonly gunModel: Model<GunsModel>,
      private readonly logger: Logger) {
    this.logger.setContext(GunService.name);
  }

  async find(filter: any): Promise<[GunsModel]> {
    return this.gunModel.find(filter).exec();
  }

  async findOne(filter: object): Promise<GunsModel> {


    return this.gunModel.findOne(filter).exec();
  }

  async add(data: GunsModel): Promise<GunsModel> {
    const gun = await this.gunModel(data);
    
    return gun.save();
  }

  async updateOne(gun: GunsModel): Promise<GunsModel> {
    return this.gunModel.updateOne({ArmeiroId: gun.ArmeiroId}, gun).exec();
  }
}
