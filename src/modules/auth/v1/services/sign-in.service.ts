import { Injectable, Inject, Logger } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { promisify } from 'util';
import * as uuidv1 from 'uuid/v1'; // based in timestamp
import { sign } from 'jsonwebtoken';
import * as dateformat from 'dateformat';
import { compare } from 'bcrypt';

import { environment } from '../../../../config/environment';

import { AuthsService } from './auths.service';
import { SessionsService } from './sessions.service';
import { getResponse } from '../../../core/helpers/response.helper';

import { SessionModel } from '../models/session.model';
import { AdService } from './ad.service';
import { AuthModel } from '../../../core/models/auth.model';
import { AdUser } from '../../../core/models/ad-user.model';

@Injectable()
export class SignInService {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    private readonly authsService: AuthsService,
    private readonly logger: Logger,
    private readonly sessionService: SessionsService,
    private readonly adService: AdService
  ) {
    // promisifying this method to avoid the callback hell
    promisify(compare);
  }

  async signIn(body) {
    this.logger.setContext(SignInService.name);

    // find the auth
    let auth: AuthModel;
    let adUser: AdUser;

    try {
      auth = await this.authsService.findAuth({ authId: body.authId });
      if (!auth) {
        this.logger.error('Auth not found on local db. Try to find on AD...');

        // Try to find user on AD
        adUser = await this.adService.findUser(body.authId);
        if (!adUser) {
          this.logger.error('Auth not found');
          return getResponse(401, { resultMessage: 'messages.errors.invalid_credentials' });
        }

        // convert to local user
        auth = adUser.toLocalUser(adUser);

        // check if user is admin
        auth.isAdmin = await this.adService.isMemberOf(body.authId, 'CCF-FZGUARD-SUPERADMIN');
      }

      if (!auth.isActive) {
        this.logger.error('Account isn\'t confirmed');
        return getResponse(423, { resultMessage: 'messages.errors.account_not_confirmed' });
      }
    } catch (e) {
      this.logger.error('Error accessing AuthSchema');
      return getResponse(500);
    }

    if (adUser) {
      console.log('AD', adUser);
      // Try to authenticate on AD
      let adAuth: string = body.authId;
      if (adAuth.indexOf('@') < 0 ) {
        adAuth += '@marinha.pt';
      }
      
      let isAdUserValid = await this.adService.authenticate(adAuth, body.password);

      if (!isAdUserValid) {
        this.logger.error('AD authentication failed');
        return getResponse(401, { resultMessage: 'messages.errors.invalid_credentials' });
      }
    } else {
      // compare the passwords
      try {
        const result = await compare(body.password, auth.password);

        if (!result) {
          this.logger.error('Passwords don\'t match');
          return getResponse(401, { resultMessage: 'messages.errors.invalid_credentials' });
        }
      } catch (e) {
        this.logger.error('Error comparing the passwords');
        return getResponse(500);
      }
    }

    // check session type
    if (body.sessionType == 'api' && !auth.isApi) {
      this.logger.error('Invalid session type for user.');
      return getResponse(401, { resultMessage: 'Invalid session type for user.' });
    }

    // generate the sessionId
    const sessionId = uuidv1();

    // create the token
    const tokenModel = {
      authId: auth.authId,
      sessionId,
      sessionType: body.sessionType,
      numberOfLogins: auth.numberOfLogins + 1,
      lastLoginDate: Math.round(+new Date() / 1000),
      ttl: body.sessionType == 'api' ? -1 : (environment.tokenTtl || 172800),
      createdAt: Math.round(+new Date() / 1000)
    };

    const token = sign(tokenModel, environment.jwtPrivateKey, { algorithm: 'RS256' });

    this.logger.log('Token generated, updating number of logins');

    // update the number of logins
    try {
      await this.authsService.updateAuth({ query: { authId: auth.authId }, update: { numberOfLogins: auth.numberOfLogins + 1 } });
    } catch (e) {
      this.logger.error('Error updating the auth');
      return getResponse(500);
    }

    const nowTimestamp = Math.round(+new Date() / 1000);

    // create session
    const session = new SessionModel({
      sessionId,
      authId: auth.authId,
      lastLoginFrom: this.req.ip,
      lastLoginDate: nowTimestamp,
      lastToken: token,
      sessionType: body.sessionType,
      context: body.context || '',
      expiresAt: nowTimestamp + (environment.tokenTtl || 172800),
      description: `My session ${dateformat(new Date(), 'fullDate')}`
    });

    try {
      await this.sessionService.createSession(session);

      return getResponse(200, { data: { token, email: auth.authId, name: auth.name, isAdmin: auth.isAdmin } })
    } catch (e) {
     
     console.error(e);
      this.logger.error('Error saving the session');
      return getResponse(500);
    }
  }
}
