import { Injectable, Logger } from '@nestjs/common';
import { Constants } from '../../../../config/constants';

import { AuthsService } from './auths.service';

import { getResponse } from '../../../core/helpers/response.helper';

@Injectable()
export class ConfirmAccountService {
  constructor(
    private readonly authsService: AuthsService,
    private readonly logger: Logger
  ) {
  }

  async confirmAccount(body) {
    this.logger.setContext(ConfirmAccountService.name);

    const nowTimestamp = Math.round(+new Date() / 1000);

    // see if the code is valid
    let auth;
    try {
      auth = await this.authsService.findAuth(
        {
          activationToken: body.token,
          confirmationCode: body.confirmationCode,
          confirmationCodeCreatedAt: { $gt: nowTimestamp - Constants.CONFIRMATION_CODE_TTL }
        });
      if (!auth) {
        this.logger.error('Confirmation code invalid or auth already active');
        return getResponse(400, { resultMessage: 'Confirmation code is invalid' });
      }
    } catch (e) {
      this.logger.error('Error accessing authschema');
      return getResponse(500);
    }

    // update the auth
    try {
      await this.authsService.updateAuth({
        query: { authId: auth.authId },
        update: {
          confirmationCode: '', confirmationCodeCreatedAt: '', isActive: true, activationToken: ''
        }
      });
    } catch (e) {
      this.logger.error(`Error updating auth: ${e.resultMessage}`);
      return getResponse(500);
    }

    return getResponse(200, { data: { name: auth.name, authId: auth.authId } });
  }
}
