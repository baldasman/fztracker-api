import { Controller, Get, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import moment = require('moment');
import { AuthGuard } from '../../core/guards/auth.guard';
import { getResponse } from '../../core/helpers/response.helper';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { EntityService } from '../services/entity.service';
import { MovementService } from '../services/movement.service';

@Controller('fztracker/analytics/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Analytics')
export class AnalyticsV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly movementService: MovementService,
    private readonly entitiesService: EntityService
  ) {
    this.logger.log('Init Analytics@1.0.0 controller', AnalyticsV1Controller.name);
  }

  @Get('movements/byDate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search movements by date' })
  @ApiCreatedResponse({ description: 'Successfully returned movements', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getMovementsByDate(
    @Query('inOut') inOut: string,
    @Query('from') from: string,
    // Order by params
    @Query('sortBy') sortBy: string,
    @Query('sortDir') sortDir: number,
    @Res() res: Response
  ): Promise<object> {
    try {
      sortBy = sortBy || 'movementDate';
      sortDir = sortDir || 1;
      console.log(`getMovementsByDate: inOut=${inOut} from=${from}, sortBy=${sortBy}`);

      /* let filter:any = {};
      filter.inOut = inOut || true; */

      let filter:any = {};
      filter.inOut = inOut && inOut.toLocaleLowerCase() === 'true' ? true : false;
      
      if (from) {
        const dateFilter = moment(from).startOf('day');
        filter = { ...filter, movementDate: { $gte: dateFilter.toDate() } };
      }

      console.log('filter', filter);
      const movements = await this.movementService.find(filter);

      const response = getResponse(200, { data: { movements } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }


  @Get('movements/countbyDate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search movements by date' })
  @ApiCreatedResponse({ description: 'Successfully returned movements', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getMovementsCountByDate(
    @Query('inOut') inOut: string,
    @Query('from') from: string,
   
    // Order by params
    
    @Res() res: Response
  ): Promise<object> {
    try {
     
      console.log(`getMovementsCountByDate: inOut=${inOut} from=${from}`);

      let filter: any = {};
      filter.inOut = inOut && inOut.toLocaleLowerCase() === 'true' ? true : false;

      if (from) {
        const dateFilter = moment(from).startOf('day');
        const dataFilterEnd = moment(from).endOf('day');
        filter = { ...filter, movementDate: { $gte: dateFilter.toDate() , $lte: dataFilterEnd.toDate() } };
      }
     

      console.log('filter getMovementsCountByDate ', filter);
      const count = await this.movementService.findAndCount(filter);

      const response = getResponse(200, { data: { count } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }

















  @Get('entitesCountByState')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search movements by date' })
  @ApiCreatedResponse({ description: 'Successfully returned count', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async entitesCountByState(
    @Query('inOut') inOut: string,
    @Query('local') local: string,
    @Query('from') from: string,
    @Res() res: Response
  ): Promise<object> {
    try {
      console.log(`contra nº entidades: inOut=${inOut} local=${local} data=${from}`);


      //estou a forçar esta data, pois é a data em que o sistema oficialmete foi implementado. 
      let date = new Date('2021-07-11');
      from = date.toISOString();
      console.log('by tfuzo:' , from);
      let filter: any = {};
      filter.inOut = inOut && inOut.toLocaleLowerCase() === 'true' ? true : false;

      if (local) {
        filter = { ...filter, lastlocal: local };
      }

      if (from) {
        const dateFilter = moment(from).startOf('day');
        const dataFilterEnd = moment().endOf('day');
        filter = { ...filter, lastMovementDate: { $gte: dateFilter.toDate() , $lte: dataFilterEnd.toDate() } };
      }

      console.log('entitesCountByState: filter', filter);
      const count = await this.entitiesService.findAndCount(filter);

      const response = getResponse(200, { data: { count } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }
}
