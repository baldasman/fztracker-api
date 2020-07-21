import {Injectable, Logger} from '@nestjs/common';
import {getResponse} from '../../../core/helpers/response.helper';

import {AuthsService} from './auths.service';
import {DecodeTokenService} from './decode-token.service';
import {SessionsService} from './sessions.service';

@Injectable()
export class VerifyTokenService {
  constructor(
      private readonly authsService: AuthsService,
      private readonly decodeTokenService: DecodeTokenService,
      private readonly logger: Logger,
      private readonly sessionService: SessionsService) {}

  async verifyToken(token, res) {
    this.logger.setContext(VerifyTokenService.name);

    // decode the token
    const decoded = await this.decodeTokenService.decodeToken(token);

    if (decoded === null) {
      return getResponse(401, {resultMessage: 'Invalid token'});
    }

    // find the auth
    let auth;
    try {
      auth = await this.authsService.findAuth({authId: decoded.authId});
      if (!auth) {
        this.logger.error('Auth not found');
        return getResponse(401);
      }
    } catch (e) {
      this.logger.error('Error accessing authschema');
      return getResponse(500);
    }

    // find the session
    let session;
    try {
      session = await this.sessionService.findSession(
          {sessionId: decoded.sessionId, authId: decoded.authId});
      if (!session) {
        this.logger.error('Session not found');
        return getResponse(401);
      }
    } catch (e) {
      this.logger.error('Error accessing sessionschema');
      return getResponse(500);
    }

    // Validate API
    if (session.sessionType == 'api') {
      res.header('Authorization', token);
      return getResponse(200, {data: {session: decoded, user: {name: auth.name, isAdmin: auth.isAdmin}}});
    }

    // check if the session is still valid in case it's time based
    const now = Math.round(+new Date() / 1000);
    if (session.expiresAt) {
      if (session.expiresAt < now) {
        this.logger.error('Expired session');
        return getResponse(401);
      }

      // update the expiresAt of the token
      try {
        await this.sessionService.updateSession({
          query: {sessionId: decoded.sessionId, authId: decoded.authId},
          update: {expiresAt: now + decoded.ttl}
        });
      } catch (e) {
        this.logger.error('Error updating session expiresAt');
        return getResponse(500);
      }
    }

    res.header('Authorization', token);
    return getResponse(200, {data: {session: decoded, user: {name: auth.name, isAdmin: auth.isAdmin}}});
  }
}
