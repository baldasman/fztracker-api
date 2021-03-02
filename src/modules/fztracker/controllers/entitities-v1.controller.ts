import { BadRequestException, Body, Controller, Get, HttpStatus, Logger, NotFoundException, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../core/guards/auth.guard';
import { getResponse } from '../../core/helpers/response.helper';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { CardModel } from '../models/card.model';
import { EntityImportModel, EntityModel, EntityResource, ImportEntityRequest } from '../models/entity.model';
import { LogModel } from '../models/log.model';
import { MovementModel } from '../models/movement.model';
import { ReadingModel } from '../models/reading.model';
import { CardService } from '../services/card.service';
import { EntityService } from '../services/entity.service';
import { LogService } from '../services/log.service';
import { MovementService } from '../services/movement.service';
import { ParseService } from '../services/parser.service';
import { ReadingService } from '../services/reading.service';

@Controller('fztracker/entities/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Entities')
export class EntitiesV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly cardService: CardService,
    private readonly entityService: EntityService,
    private readonly readingService: ReadingService,
    private readonly logService: LogService,
    private readonly movementService: MovementService,
    private readonly parserService: ParseService) {
    this.logger.log('Init Entities@1.0.0 controller', EntitiesV1Controller.name);
  }

  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Entitys' })
  @ApiCreatedResponse({ description: 'Successfully returned entity list', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getEntities(
    // @Req() req: any,
    @Query('serial') serial: string,
    @Query('cardNumber') cardNumber: string,
    @Query('cardId') cardId: string,
    @Query('page') page: number,
    @Query('rows') rows: number,
    @Res() res: Response
  ): Promise<object> {
    try {
      console.log('filtros', serial, cardNumber, page, rows);
      let filter = {};

      if (serial && serial.trim().length > 0) {
        filter = { ...filter, 'permanent.serial': serial };
      }

      if (cardNumber && cardNumber.trim().length > 0) {
        filter = { ...filter, cardNumber };
      }

      if (cardId && cardId.trim().length > 0) {

        const card = await this.cardService.findOne({ uid: cardId.toUpperCase() });
        console.log('cardId', cardId.toUpperCase(), card);
        if (card) {
          filter = { ...filter, cardNumber: card.cardNumber };
        }

      }

      console.log('search', filter);
      const entities = await this.entityService.find(filter, rows , page );

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
  async addMovement(
    @Body() movement: MovementModel,
    @Res() res: Response
  ):
    Promise<object> {
    console.log('movement', movement);

    try {
      let entity: EntityModel;

      if (movement.cardId) {

        const c = await this.cardService.findOne({ uid: movement.cardId.toUpperCase() });
        console.log('cardId', movement.cardId.toUpperCase(), c);
        if (!c) {
          throw 'Card not found';
        }
        movement.cardNumber = c.cardNumber;
      }


      entity = await this.entityService.findOne({ 'cardNumber': movement.cardNumber });
      movement.cardId = entity.cardId;


      if (!entity) {
        throw `No entity assigned to card "${movement.manual ? movement.cardNumber : movement.cardId}"`;
      }

      // Find card
      const card = await this.cardService.findOne({ cardNumber: entity.cardNumber });
      if (!card) {
        throw 'Card not found';
      }

      if (card.state !== CardModel.STATE_ACTIVE) {
        throw 'Card not active';
      }

      entity.inOut = movement.inOut ? movement.inOut : !entity.inOut;
      movement.inOut = entity.inOut;

      // Check plates
      if (movement.plate && movement.plate.length > 0) {
        const plate = entity.resources.find(r => r.type === 'VEHICLE' && r.serial.replace(/-/g, '') === movement.plate.replace(/-/g, ''));
        if (!plate) {
          entity.resources.push({ type: 'VEHICLE', serial: movement.plate.replace(/-/g, '') });
        }
      }

      const reading = new ReadingModel();
      reading.location = movement.location;
      reading.sensor = movement.sensor;
      reading.movementId = movement.uid;
      reading.cardId = movement.cardId;
      reading.cardNumber = movement.cardNumber;
      reading.manual = movement.manual;

      // update entity data
      movement.entitySerial = entity.permanent.serial;
      movement.entityType = entity.permanent.type;
      movement.entityName = `${entity.nopermanent.rank} ${entity.permanent.name}`

      // Save models
      await this.readingService.add(reading);
      await this.movementService.add(movement);
      await this.entityService.updateOne(entity);

      const response = getResponse(200, { data: { movement } });

      global['io'].emit(`movement`, { movement, entity });

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

  @Post(':entitySerial/assign-card')
  @ApiOperation({ summary: 'Add new entity movement' })
  @ApiCreatedResponse({ description: 'Successfully created entity movement', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async assignCard(
    @Param('entitySerial') entitySerial: string,
    @Body('cardNumber') cardNumber: string,
    @Req() req: any,
    @Res() res: Response
  ):
    Promise<object> {
    console.log('aassignCard:', entitySerial, cardNumber);

    let entity: EntityModel;
    entity = await this.entityService.findOne({ 'permanent.serial': entitySerial });
    if (!entity) {
      throw new NotFoundException(`Entity '${entitySerial}' not found.`);
    }

    // Find new card
    let card = await this.cardService.findOne({ cardNumber });
    if (!card) {
      throw new NotFoundException(`Card '${cardNumber}' not found.`);
    }

    // Check if entity already has an active card 
    if (entity.cardNumber && entity.cardNumber.trim().length > 0) {
      let currentCard = await this.cardService.findOne({ cardNumber: entity.cardNumber, state: CardModel.STATE_ACTIVE });
      if (!currentCard) {
        throw new NotFoundException(`Entity '${entity.permanent.serial}' already assigned to card '${entity.cardNumber}', but card '${cardNumber}' was not found.`);
      }

      throw new BadRequestException(`Entity '${entity.permanent.serial}' already assigned to card '${entity.cardNumber}'`);
    }

    // Check if card is already assigned to a different entity
    if (card.entitySerial && card.entitySerial.trim().length > 0 && card.entitySerial !== entity.permanent.serial) {
      throw new BadRequestException(`Card '${card.cardNumber}' already assigned to Entity '${card.entitySerial}'.`);
    }

    try {
      // Update card info
      card.entitySerial = entity.permanent.serial;
      card.entityType = entity.permanent.type;
      card.entityDesc = `${entity.nopermanent.rank} ${entity.permanent.name}`;
      card.lastChangeDate = new Date();

      // Update entity
      entity.cardId = card.uid;
      entity.cardNumber = card.cardNumber;

      // Save models
      card = await this.cardService.updateOne(card);
      entity = await this.entityService.updateOne(entity);

      // Add card log
      const log = new LogModel();
      log.action = LogModel.ACTION_CARD_ASSIGNED;
      log.obs = `${entitySerial}`;
      log.userId = req.context.session.authId;
      this.logService.add(log);

      const response = getResponse(200, { data: { card, entity } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }
  }

  @Post(':entitySerial/remove-card')
  @ApiOperation({ summary: 'Add new entity movement' })
  @ApiCreatedResponse({ description: 'Successfully created entity movement', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async removeCard(
    @Param('entitySerial') entitySerial: string,
    @Req() req: any,
    @Res() res: Response
  ):
    Promise<object> {
    console.log('removeCard:', entitySerial);

    try {
      let entity: EntityModel;
      entity = await this.entityService.findOne({ 'permanent.serial': entitySerial });
      if (!entity) {
        return res.status(404).send({ error: `Entity '${entitySerial}' not fouund.` });
      }

      if (!entity.cardNumber) {
        return res.status(HttpStatus.OK).send(getResponse(HttpStatus.OK, { data: {} }));
      }

      // Find card
      let card = await this.cardService.findOne({ cardNumber: entity.cardNumber });
      if (!card) {
        return res.status(404).send({ error: `Card '${entity.cardNumber}' not found.` });
      }

      // Update card info
      card.entitySerial = null;
      card.entityType = null;
      card.entityDesc = null;
      card.lastChangeDate = new Date();

      // Update entity
      entity.cardId = null;
      entity.cardNumber = null;

      // Save models
      card = await this.cardService.updateOne(card);
      entity = await this.entityService.updateOne(entity);

      // Add card log
      const log = new LogModel();
      log.action = LogModel.ACTION_CARD_RELEASED;
      log.obs = `${entitySerial}`;
      log.userId = req.context.session.authId;
      this.logService.add(log);

      const response = getResponse(200, { data: { card, entity } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }
  }
}
