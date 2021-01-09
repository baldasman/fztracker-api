import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import moment = require('moment');
import { AuthGuard } from '../../core/guards/auth.guard';
import { getResponse } from '../../core/helpers/response.helper';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { MovementService } from '../services/movement.service';


@Controller('fztracker/movements/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Movements')
export class MovementsV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly movementService: MovementService) {
    this.logger.log('Init Movements@1.0.0 controller', MovementsV1Controller.name);
  }

  @Get('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all movements' })
  @ApiCreatedResponse({ description: 'Successfully returned card movements', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getMoviments(
    @Query('search') search: string,
    @Query('from') searchFrom: string,
    @Query('to') searchTo: string,
    @Res() res: Response
  ): Promise<object> {
    try {
      console.log('search', search, searchFrom, searchTo);
      let filter = {};
      if (search) {
         filter = {...filter, entitySerial: search};
      }

      const fromDate = moment(searchFrom).startOf('day');
      const toDate = moment(searchTo).endOf('day');
     

      

       filter['movementDate'] = {$gte: fromDate.toDate(), $lte: toDate.toDate()};
       console.log('filter', filter);
      const movements = await this.movementService.find(filter);



      const response = getResponse(200, { data: { movements } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }



}
