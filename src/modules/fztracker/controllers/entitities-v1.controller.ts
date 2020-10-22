import { Body, Controller, Get, Logger, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../core/guards/auth.guard';
import { getResponse } from '../../core/helpers/response.helper';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { CardReadingModel } from '../models/card.model';
import { EntityImportModel, EntityModel, EntityMovementModel, EntityResource, ImportEntityRequest } from '../models/entity.model';
import { CardService } from '../services/card.service';
import { EntityService } from '../services/entity.service';
import { ParseService } from '../services/parser.service';
import { LogModel } from '../models/log.model';


@Controller('fztracker/entities/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Entities')
export class EntitiesV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly cardService: CardService,
    private readonly entityService: EntityService,
    private readonly parserService: ParseService) {
    this.logger.log('Init Entities@1.0.0 controller', EntitiesV1Controller.name);
  }


  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Entitys' })
  @ApiCreatedResponse({ description: 'Successfully returned entity list', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getCards(
    // @Req() req: any,
    @Query('page') page: number,
    @Query('rows') rows: number,
    @Res() res: Response
  ): Promise<object> {
    try {
      const filter = {};
      const entities = await this.entityService.find(filter, rows || 10, page || 1);

      const response = getResponse(200, { data: { records: entities.length, entities } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }







  @Post('')
  @ApiOperation({ summary: 'Add new entity' })
  @ApiCreatedResponse({ description: 'Successfully created entity', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async addEntity(
    @Body() entity: EntityModel,
    @Res() res: Response
  ):
    Promise<object> {
    console.log('entity', entity);

    try {
      const newEntity = await this.entityService.add(entity);
      const response = getResponse(200, { data: { entity: newEntity } });

      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }
  }

  @Post('movement')
  @ApiOperation({ summary: 'Add new entity movement' })
  @ApiCreatedResponse({ description: 'Successfully created entity movement', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async add(
    @Body() movement: EntityMovementModel,
    @Res() res: Response
  ):
    Promise<object> {
    console.log('movement', movement);

    try {
      let entity: EntityModel;

      if (movement.manual) {
        entity = await this.entityService.findOne(
          { 'cardNumber': movement.cardNumber });
      } else {
        entity = await this.entityService.findOne({ 'cardId': movement.cardId });
      }

      if (!entity) {
        throw `No entity assigned to card "${movement.manual ? movement.cardNumber : movement.cardId}"`;
      }

      // TODO: validate last movement timestamp
      entity.inOut = entity.inOut ? false : true;
      movement.inOut = entity.inOut;
      entity.movements.push(movement);

      // Find card
      let card =
        await this.cardService.findOne({ cardNumber: entity.cardNumber });

      if (!card) {
        throw 'Card not found';
      }

      const reading = new CardReadingModel();
      reading.location = movement.location;
      reading.sensor = movement.sensor;
      reading.movementId = movement.id;

      // TODO: create reading

      // Save models
      card = await this.cardService.updateOne(card);
      entity = await this.entityService.updateOne(entity);

      const response = getResponse(200, { data: { movement } });

      global['io'].emit(`movement/${movement.location}`, movement);

      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import entities from CSV' })
  @ApiCreatedResponse({ description: 'Successfully imported entities from csv', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async importEntities(
    @Body() body: ImportEntityRequest,
    @Res() res: Response
  ): Promise<object> {
    console.log('file', body.file);
    try {
      // Parse csv file
      const headers = [
        'serial', 'rank', 'class', 'name', 'location', 'unit', 'type', 'resource1', 'resource2', 'resource3', 'resource4', 'other'
      ];

      let successCounter = 0;
      let data;
      // const dataFile = join(__dirname, '../../../assets', 'import', file);
      const dataFile = body.file;
      console.log(dataFile, dataFile);

      data = await this.parserService.parseEntities(dataFile, headers, ';');
      /**
       list: T[];
        total: number;
        count: number | null;
        offset: number | null;
       */

      // console.log('data', data);

      if (data) {
        for (let i = 0; i < data.list.length; i++) {
          const entityToImport: EntityImportModel = data.list[i];

          if (!entityToImport.serial) {
            continue;
          }

          // Find entity by serial
          let entity = await this.entityService.findOne({ 'permanent.serial': entityToImport.serial });
          let update = true;

          if (!entity) {
            update = false;

            // create new entity
            entity = new EntityModel();
            entity.permanent.serial = entityToImport.serial;
            entity.state = EntityModel.STATE_ACTIVE;
          }

          entity.nopermanent.rank = entityToImport.rank;
          entity.permanent.class = entityToImport.class;
          entity.permanent.name = entityToImport.name;
          entity.nopermanent.location = entityToImport.location;
          entity.nopermanent.unit = entityToImport.unit;
          entity.permanent.type = entityToImport.type;

          if (!entity.resources) {
            entity.resources = [];
          }

          if (entityToImport.resource1 && entityToImport.resource1.trim() !== '') {
            if (!entity.resources.find(r => r.serial = entityToImport.resource1.trim())) {
              entity.resources.push(new EntityResource(entityToImport.resource1.trim(), 'VEHICLE'));
            }
          }

          if (entityToImport.resource2 && entityToImport.resource2.trim() !== '') {
            if (!entity.resources.find(r => r.serial = entityToImport.resource2.trim())) {
              entity.resources.push(new EntityResource(entityToImport.resource2.trim(), 'VEHICLE'));
            }
          }

          if (entityToImport.resource3 && entityToImport.resource3.trim() !== '') {
            if (!entity.resources.find(r => r.serial = entityToImport.resource3.trim())) {
              entity.resources.push(new EntityResource(entityToImport.resource3.trim(), 'VEHICLE'));
            }
          }

          if (entityToImport.resource4 && entityToImport.resource4.trim() !== '') {
            if (!entity.resources.find(r => r.serial = entityToImport.resource4.trim())) {
              entity.resources.push(new EntityResource(entityToImport.resource4.trim(), 'VEHICLE'));
            }
          }

          try {
            if (update) {
              await this.entityService.updateOne(entity);
            } else {
              await this.entityService.add(entity);
            }

            successCounter++;
          } catch (e) {
            console.error('Failed to import entity #' + i, entityToImport, e);
          }
        }
      }

      const response = { message: `${successCounter}/${data.total} entities imported.` }
      return res.status(200).send(response);
    } catch (e) {
      console.error('Failed to import entities.', e);

      // return res.status(200).send(response);
      return res.status(400).send({ error: e, message: 'Failed to import entities.' });
    }
  }


}
