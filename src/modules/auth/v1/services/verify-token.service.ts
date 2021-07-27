import {Injectable, Logger} from '@nestjs/common';
import {getResponse} from '../../../core/helpers/response.helper';
import { AdService } from './ad.service';

import {AuthsService} from './auths.service';
import {DecodeTokenService} from './decode-token.service';
import {SessionsService} from './sessions.service';

@Injectable()
export class VerifyTokenService {
  constructor(
      private readonly authsService: AuthsService,
      private readonly decodeTokenService: DecodeTokenService,
      private readonly logger: Logger,
      private readonly adService: AdService,
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
    let adUser;
   
    try {
      console.log(decoded);
      auth = await this.authsService.findAuth({ authId:  decoded.authId });
      if (!auth) {
        this.logger.log('Auth not found on local db. Try to find on AD...');

        // Try to find user on AD
        adUser = await this.adService.findUser( decoded.externalId);
        if (!adUser) {
          this.logger.error('Auth not found: '+ decoded.externalId);
          return getResponse(401, { resultMessage: 'messages.errors.invalid_credentials' });
        }

        // convert to local user
        auth = adUser.toLocalUser(adUser);

        // check if user is admin
        auth.isAdmin = await this.adService.isMemberOf(decoded.externalId, 'CCF-FZGUARD-SUPERADMIN');
        auth.acessRank = await this.adService.isMemberOf(decoded.externalId, 'CCF-FZGUARD-ADMIN');
        console.log ( 'qual é o rank access', auth.acessRank);
      }

      if (!auth.isActive) {
        this.logger.error('Account isn\'t confirmed');
        return getResponse(423, { resultMessage: 'messages.errors.account_not_confirmed' });
      }
    } catch (e) {
      this.logger.error('Error accessing AuthSchema');
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
    return getResponse(200, {data: {session: decoded, user: {name: auth.name, isAdmin: auth.isAdmin,  acessRank: auth.acessRank}}});
  }
}
