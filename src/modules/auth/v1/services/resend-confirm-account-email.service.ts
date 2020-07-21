import { Injectable, Logger } from '@nestjs/common';

import { AuthsService } from './auths.service';
import { getResponse } from '../../../core/helpers/response.helper';

import generateCode from '../helpers/generate-code.helper';

@Injectable()
export class ResendConfirmAccountEmailService {
  constructor(
    private readonly authsService: AuthsService,
    private readonly logger: Logger
  ) {
  }

  async resendEmail(body) {
    this.logger.setContext(ResendConfirmAccountEmailService.name);

    // generate new confirmation code
    const confirmationCode = generateCode();

    const nowTimestamp = Math.round(+new Date() / 1000);

    // find the auth
    try {
      const auth = await this.authsService.findAuth({ authId: body.authId });
      if (!auth) {
        this.logger.error('Auth not found');
        return getResponse(401, { resultMessage: 'Invalid authId' });
      }
    } catch (e) {
      this.logger.error('Error accessing AuthSchema');
      return getResponse(500);
    }

    try {
      await this.authsService.updateAuth({ query: { authId: body.authId }, update: { confirmationCode, confirmationCodeCreatedAt: nowTimestamp } });
    } catch (e) {
      this.logger.error(`Error updating auth: ${e.resultMessage}`);
      return getResponse(500);
    }

    return getResponse(200);
  }
}
