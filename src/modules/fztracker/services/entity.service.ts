import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityModel } from '../models/entity.model';

@Injectable()
export class EntityService {
  constructor(
    @InjectModel('Entity') private readonly entityModel: Model<EntityModel>,
    private readonly logger: Logger) {
    this.logger.setContext(EntityService.name);
  }

  async find(filter: any, rows: number, page: number): Promise<[EntityModel]> {
    const offset = (page - 1) * rows;
    return this.entityModel.find(filter).limit(rows).skip(offset).exec();
  }

  async findOne(filter: object): Promise<EntityModel> {
    return this.entityModel.findOne(filter).exec();
  }

  async add(data: EntityModel): Promise<EntityModel> {
    const entity = await this.entityModel(data);
    return entity.save();
  }

  async updateOne(entity: EntityModel): Promise<EntityModel> {
    return this.entityModel.updateOne({ "serial": entity.serial }, entity).exec();
  }
}
