import { Injectable, Logger } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

import { environment } from '../../../../config/environment';

import { AuthsService } from './auths.service';

import { getResponse } from '../../../core/helpers/response.helper';
import generateCode from '../helpers/generate-code.helper';

import { AuthModel } from '../../../core/models/auth.model';

@Injectable()
export class SignUpService {
  constructor(
    private readonly authsService: AuthsService,
    private readonly logger: Logger
  ) {
  }

  async signUp(body) {
    this.logger.setContext(SignUpService.name);

    const tokenPayload = {
      authId: body.authId,
      name: body.name
    };

    // generate activationToken and confirmationCode
    const activationToken = sign(tokenPayload, environment.jwtPrivateKey, { algorithm: 'RS256' });

    const confirmationCode = generateCode();

    const nowTimestamp = Math.round(+new Date() / 1000);

    const newAuth = new AuthModel({
      authId: body.authId,
      password: body.password || '',
      name: body.name,
      numberOfLogins: 0,
      confirmationCode,
      createdAt: nowTimestamp,
      confirmationCodeCreatedAt: nowTimestamp,
      isActive: true,
      isAdmin: false,
      isApi: false,
      deletedAt: null,
      deactivatedAt: null,
      activationToken
    });

    // create the new auth
    try {
      await this.authsService.createAuth(newAuth);
      // return getResponse(200, { data: { activationToken, confirmationCode } });
    } catch (e) {
      this.logger.error(`Error saving the Auth ${e.message}`);
      return getResponse(400, { resultMessage: 'Error creating the user' });
    }

    return getResponse(200);
  }
}
