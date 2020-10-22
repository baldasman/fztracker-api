import { Controller, Logger, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';


@Controller('fztracker/movements/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Movements')
export class MovementsV1Controller {
  constructor(
    private readonly logger: Logger) {
    this.logger.log('Init Movements@1.0.0 controller', MovementsV1Controller.name);
  }


}
