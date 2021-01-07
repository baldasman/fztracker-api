import { Body, Controller, Get, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
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
    @Req() req: any,
    @Res() res: Response
  ): Promise<object> {
    try {
      const filter = {};
      const movements = await this.movementService.find(filter);



      const response = getResponse(200, { data: { movements } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }



}
