import { Module } from '@nestjs/common';
import { AdService } from '../core/services/ad.service';

import { AuthV1Module } from './v1/auth-v1.module';

@Module({
  imports: [
    AuthV1Module
  ],
  exports: [
    AuthV1Module
  ],
  providers: [AdService],
})
export class AuthModule { }
