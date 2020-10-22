import { Controller, Logger, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';


@Controller('fztracker/logs/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Logs')
export class LogsV1Controller {
  constructor(
    private readonly logger: Logger) {
    this.logger.log('Init Logs@1.0.0 controller', LogsV1Controller.name);
  }


}
