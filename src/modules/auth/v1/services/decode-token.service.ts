import { Injectable, Logger } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { promisify } from 'util';

import { environment } from '../../../../config/environment';

import { TokenModel } from '../../../core/models/token.model';

@Injectable()
export class DecodeTokenService {
  constructor(
    private readonly logger: Logger
  ) {
    promisify(verify);
  }

  async decodeToken(token): Promise<TokenModel> {
    this.logger.setContext(DecodeTokenService.name);

    try {
      const decoded = await verify(token, environment.jwtPublicKey, { algorithms: ['RS256'] });
      return decoded;
    } catch (e) {
      this.logger.error('Error decoding token');
      return null;
    }
  }

}
