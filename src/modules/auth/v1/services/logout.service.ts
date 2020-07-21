import { Injectable, Logger, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { DecodeTokenService } from './decode-token.service';
import { SessionsService } from './sessions.service';

import { getResponse } from '../../../core/helpers/response.helper';

@Injectable()
export class LogoutService {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    private readonly decodeTokenService: DecodeTokenService,
    private readonly logger: Logger,
    private readonly sessionService: SessionsService
  ) {
  }

  async logout() {
    this.logger.setContext(LogoutService.name);

    // decode the token
    const decoded = await this.decodeTokenService.decodeToken(this.req['token']);

    if (decoded === null) {
      return getResponse(401, { resultMessage: 'Invalid token' });
    }

    // delete the session
    try {
      await this.sessionService.deleteSession({ sessionId: decoded.sessionId });
    } catch (e) {
      this.logger.error('Error accessing sessionschema');
      return getResponse(500);
    }

    return getResponse(200);
  }
}
