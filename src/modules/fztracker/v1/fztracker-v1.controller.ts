import {Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {Response} from 'express';
import {AuthGuard} from '../../core/guards/auth.guard';
import {getResponse} from '../../core/helpers/response.helper';
import {SuccessResponseModel} from '../../core/models/success-response.model';
import {CardLogModel, CardModel, CardReadingModel} from './models/card.model';
import {EntityLogModel, EntityModel, EntityMovementModel} from './models/entity.model';
import {CardService} from './services/card.service';
import {EntityService} from './services/entity.service';
import {UserService} from './services/user.service';


@Controller('fztracker/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('FZtracker')
export class FZtrackerV1Controller {
  constructor(
      private readonly logger: Logger,
      private readonly cardService: CardService,
      private readonly entityService: EntityService,
      private readonly userService: UserService) {
    this.logger.log('Init fztracker controller', FZtrackerV1Controller.name);
  }

  @Get('user/info')
  @ApiOperation({ summary: 'Get server hello' })
  @ApiOkResponse({ description: 'Hello is valid', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Token isn\'t valid' })
  @ApiQuery({ name: 'authId', description: 'The authId to describe', type: String, required: true })
  async getUserInfo(
    @Query('authId') authId: string,
    // @Param('authId') authId: string,
    @Res() res: Response
  ): Promise<object> {
    // TODO: read from database user info

    // TODO: read from mongo

    const response = {data: {authId, isActive: true, languageKey: 'en'}};
    return res.status(200).send(response);
  }

  @Get('user/list')
  @ApiOperation({ summary: 'Get list of users' })
  @ApiOkResponse({ description: 'Hello is valid', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Token isn\'t valid' })
  @ApiQuery({ name: 'name', description: 'name to filter users', type: String, required: true })
  async getAllUsers(
    @Query('name') name: string,
    @Res() res: Response
  ): Promise<object> {
    const exp = new RegExp('.*' + name + '.*', 'i');
    const filter = name ? {'name': {$regex: exp}} : {};

    const users = await this.userService.getAll(filter);

    const response = {data: {rows: users.length, users}};
    return res.status(200).send(response);
  }

  @Get('user/list/export')
  @ApiOperation({ summary: 'Get csv file qith list of users' })
  @ApiOkResponse({ description: 'Hello is valid', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Token isn\'t valid' })
  @ApiQuery({ name: 'name', description: 'name to filter users', type: String, required: true })
  async exportAllUsers(
    @Query('name') name: string,
    @Res() res: Response
  ): Promise<object> {
    const exp = new RegExp('.*' + name + '.*', 'i');
    const filter = name ? {'name': {$regex: exp}} : {};

    const users = await this.userService.getAll(filter);

    let data = '';
    users.forEach((user) => {
      data += `${user.authId},${user.name}\n`;
    });

    console.log('users', data);

    res.attachment('users.csv');
    res.contentType('text/csv');
    return res.status(200).send(data);
  }

  @Post('user')
  @ApiOperation({summary: 'Update user info'})
  @ApiCreatedResponse({description: 'Successfully updated user info', type: SuccessResponseModel})
  @ApiUnauthorizedResponse({description: 'Invalid credentials'})
  async postHello(
    @Body('email') email: string, 
    @Body('name') name: string, 
    @Body('isActive') isActive: boolean, 
    @Res() res: Response
  ):
      Promise<object> {
    const changes: any = {};

    if (!email) {
      return res.status(400).send({error: 'Field "email" is required.'});
    }

    if (name) {
      changes.name = name;
    }

    if (isActive != null) {
      changes.isActive = isActive;
    }

    const status = await this.userService.update(email, changes);
    const user = await this.userService.get(email);
    const response = {data: {user, status}};

    return res.status(200).send(response);
  }

  @Get('cards')
  @ApiBearerAuth()
  @ApiOperation({summary: 'Get all cards'})
  @ApiCreatedResponse({description: 'Successfully returned card list', type: SuccessResponseModel})
  @ApiUnauthorizedResponse({description: 'Invalid credentials'})
  async getCards(
    @Req() req: any,
    @Res() res: Response
  ): Promise<object> {
    const authId = req.context.authId;

    try {
      const filter = {authId};

      const cards = await this.cardService.find(filter);

      const response = getResponse(200, {data: {cards}});
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({error: error.errmsg});
    }
  }

  @Post('cards')
  @ApiOperation({summary: 'Add new card'})
  @ApiCreatedResponse({description: 'Successfully created card', type: SuccessResponseModel})
  @ApiUnauthorizedResponse({description: 'Invalid credentials'})
  async addCard(
    @Body() card: CardModel,
    @Res() res: Response
  ):
      Promise<object> {

    try {
      // Add log
      const log = new CardLogModel();
      log.action = CardLogModel.ACTION_CREATED;

      card.log.push(log);

      const newCard = await this.cardService.add(card);
      const response = getResponse(200, {data: {card: newCard}});

      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({error: error.errmsg});
      }

      return res.status(400).send({error: error});
    }
  }

  @Post('cards/assign')
  @ApiOperation({summary: 'Assign card to entity'})
  @ApiCreatedResponse({description: 'Successfully assigned card to entity', type: SuccessResponseModel})
  @ApiUnauthorizedResponse({description: 'Invalid credentials'})
  async assignCard(
    @Body('cardNumber') cardNumber: string,
    @Body('entitySerial') entitySerial: string,
    @Req() req: any,
    @Res() res: Response
  ):
      Promise<object> {
    console.log('cardNumber', cardNumber);
    console.log('entitySerial', entitySerial);

    try {
      // Find card
      let card = await this.cardService.findOne({cardNumber});

      if (!card) {
        throw 'Card not found';
      }

      if (card.entitySerial) {
        throw `Card already assigned to ${card.entitySerial}`;
      }

      // Find entity
      let entity =
          await this.entityService.findOne({'permanent.serial': entitySerial});

      if (!entity) {
        throw 'Entity not found';
      }

      if (entity.cardNumber) {
        throw `Entity already assigned to card ${entity.cardNumber}`;
      }

      // Assign entity to card
      card.entitySerial = entity.permanent.serial;
      card.entityType = entity.permanent.type;

      // Add card log
      const log = new CardLogModel();
      log.action = CardLogModel.ACTION_EDITED;
      log.obs = `assign to ${entitySerial}`;
      log.userId = req.context.session.authId;
      card.log.push(log);

      entity.cardId = card.id;
      entity.cardNumber = card.cardNumber;

      const entityLog = new EntityLogModel();
      entityLog.action = EntityLogModel.ACTION_EDIT;
      entityLog.obs = `assign card ${card.cardNumber}`;
      entityLog.userId = req.context.session.authId;
      entity.log.push(entityLog);

      // Save models
      card = await this.cardService.updateOne(card);
      entity = await this.entityService.updateOne(entity);

      const response = getResponse(200, {data: {success: true}});

      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({error: error.errmsg});
      }

      return res.status(400).send({error: error});
    }
  }

  @Post('entities')
  @ApiOperation({summary: 'Add new entity'})
  @ApiCreatedResponse({description: 'Successfully created entity', type: SuccessResponseModel})
  @ApiUnauthorizedResponse({description: 'Invalid credentials'})
  async addEntity(
    @Body() entity: EntityModel,
    @Res() res: Response
  ):
      Promise<object> {
    console.log('entity', entity);

    try {
      const newEntity = await this.entityService.add(entity);
      const response = getResponse(200, {data: {entity: newEntity}});

      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({error: error.errmsg});
      }

      return res.status(400).send({error: error});
    }
  }

  @Post('entities/movement')
  @ApiOperation({summary: 'Add new entity movement'})
  @ApiCreatedResponse({description: 'Successfully created entity movement', type: SuccessResponseModel})
  @ApiUnauthorizedResponse({description: 'Invalid credentials'})
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
            {'cardNumber': movement.cardNumber});
      } else {
        entity = await this.entityService.findOne({'cardId': movement.cardId});
      }

      if (!entity) {
        throw `No entity assigned to card "${
            movement.manual ? movement.cardNumber : movement.cardId}"`;
      }

      // TODO: validate last movement timestamp
      entity.inOut = entity.inOut ? false : true;
      movement.inOut = entity.inOut;
      entity.movements.push(movement);

      // Find card
      let card =
          await this.cardService.findOne({cardNumber: entity.cardNumber});

      if (!card) {
        throw 'Card not found';
      }

      const reading = new CardReadingModel();
      reading.location = movement.location;
      reading.sensor = movement.sensor;
      reading.movementId = movement.id;

      card.readings.push(reading);

      // Save models
      card = await this.cardService.updateOne(card);
      entity = await this.entityService.updateOne(entity);

      const response = getResponse(200, {data: {movement}});

      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({error: error.errmsg});
      }

      return res.status(400).send({error: error});
    }
  }
}
