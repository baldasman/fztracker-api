import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../core/guards/auth.guard';
import { getResponse } from '../../core/helpers/response.helper';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { GunService } from '../services/gun.service';
import { GunsModel } from '../models/guns.model';


@Controller('fztracker/guns/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Guns')
export class GunsV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly gunService: GunService) {
    this.logger.log('Init Guns@1.0.0 controller', GunsV1Controller.name);
  }

  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all guns' })
  @ApiCreatedResponse({ description: 'Successfully returned gun list', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getGun(
    @Req() req: any,
    @Res() res: Response
  ): Promise<object> {
    try {
      const filter = {};
      const guns = await this.gunService.find(filter);
      console.log('guns', filter,guns );
      const response = getResponse(200, { data: { guns } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }

  @Post('addgun')
  @ApiOperation({ summary: 'Add new gun' })
  @ApiCreatedResponse({ description: 'Successfully created gun', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async addGun(
    @Body() gun: GunsModel,
    @Res() res: Response
  ):
    Promise<object> {

    try {
      const newGun = await this.gunService.add(gun);

      // Add log
     
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }
  }






 /*  @Post('import')
  @ApiOperation({ summary: 'Import guns from CSV' })
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
  } */
}
