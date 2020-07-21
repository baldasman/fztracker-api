import { Injectable, Logger } from '@nestjs/common';

import { AuthsService } from './auths.service';

import { getResponse } from '../../../core/helpers/response.helper';

@Injectable()
export class RecoverPasswordService {
  constructor(
    private readonly authsService: AuthsService,
    private readonly logger: Logger
  ) {
  }

  async recoverPassword(body) {
    this.logger.setContext(RecoverPasswordService.name);

    // find the auth
    try {
      const auth = await this.authsService.findAuth({ authId: body.authId });
      if (!auth) {
        this.logger.error('Auth not found');
        return getResponse(401, { resultMessage: 'messages.errors.invalid_credentials' });
      }

      if (!auth.isActive) {
        this.logger.error('Account isn\'t confirmed');
        return getResponse(423, { resultMessage: 'messages.errors.account_not_confirmed' });
      }
    } catch (e) {
      this.logger.error('Error accessing AuthSchema');
      return getResponse(500);
    }

    return getResponse(200);
  }
}
