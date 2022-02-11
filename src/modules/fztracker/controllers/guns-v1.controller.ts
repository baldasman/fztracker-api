import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../core/guards/auth.guard';
import { getResponse } from '../../core/helpers/response.helper';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { CardImportModel, CardModel, ImportCardRequest } from '../models/card.model';
import { LogModel } from '../models/log.model';
import { CardService } from '../services/card.service';
import { EntityService } from '../../auth/v1/services/entity.service';
import { LogService } from '../services/log.service';
import { ParseService } from '../services/parser.service';


@Controller('fztracker/cards/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Cards')
export class CardsV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly cardService: CardService,
    private readonly entityService: EntityService,
    private readonly logService: LogService,
    private readonly parserService: ParseService) {
    this.logger.log('Init Cards@1.0.0 controller', CardsV1Controller.name);
  }

  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all cards' })
  @ApiCreatedResponse({ description: 'Successfully returned card list', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getCards(
    @Req() req: any,
    @Res() res: Response
  ): Promise<object> {
    try {
      const filter = {};
      const cards = await this.cardService.find(filter);
      console.log('cards', filter,cards );
      // global['io'].emit('card', { uid: 'cardId' });

      const response = getResponse(200, { data: { cards } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }

  @Post('')
  @ApiOperation({ summary: 'Add new card' })
  @ApiCreatedResponse({ description: 'Successfully created card', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async addCard(
    @Body() card: CardModel,
    @Res() res: Response
  ):
    Promise<object> {

    try {
      const newCard = await this.cardService.add(card);

      // Add log
      const log = new LogModel();
      log.action = LogModel.ACTION_CARD_CREATED;
      log.obs = `${card.cardNumber}`;
      this.logService.add(log);

      const response = getResponse(200, { data: { card: newCard } });

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
  @ApiOperation({ summary: 'Import cards from CSV' })
  @ApiCreatedResponse({ description: 'Successfully imported cards from csv', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async importCards(
    @Body() body: ImportCardRequest,
    @Res() res: Response
  ): Promise<object> {
    console.log('file', body.file);
    try {
      // Parse csv file
      const headers = [
        'uid', 'uidShort', 'cardNumber', 'state', 'cardType'
      ];

      let successCounter = 0;
      let data;
      // const dataFile = join(__dirname, '../../../assets', 'import', file);
      const dataFile = body.file;
      console.log(dataFile, dataFile);

      data = await this.parserService.parseCards(dataFile, headers, ';');

      if (data) {
        for (let i = 0; i < data.list.length; i++) {
          const cardToImport: CardImportModel = data.list[i];

          if (!cardToImport.uid) {
            console.log('Ignore: uid is null', cardToImport);
            continue;
          }

          // console.log(cardToImport);

          // Find entity by serial
          let card = await this.cardService.findOne({ uid: cardToImport.uid });
          let update = true;

          if (!card) {
            update = false;

            // create new entity
            card = new CardModel();
            card.uid = cardToImport.uid;
          }

          card.cardNumber = cardToImport.cardNumber;
          if (cardToImport.state.toLowerCase() == 'active') {
            card.state = CardModel.STATE_ACTIVE;
          } else {
            card.state = CardModel.STATE_INACTIVE;
          }

          card.entityType = cardToImport.cardType;
          card.uidShort = cardToImport.uidShort;

          try {
            if (update) {
              await this.cardService.updateOne(card);
            } else {
              await this.cardService.add(card);
            }

            successCounter++;
          } catch (e) {
            console.error('Failed to import card #' + i, cardToImport, e);
          }
        }
      }

      const response = { message: `${successCounter}/${data.total} cards imported.` }
      return res.status(200).send(response);
    } catch (e) {
      console.error('Failed to import cards.', e);

      // return res.status(200).send(response);
      return res.status(400).send({ error: e, message: 'Failed to import cards.' });
    }
  }
}
