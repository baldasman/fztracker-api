import { Module } from '@nestjs/common';
import { AuthV1Module } from './v1/auth-v1.module';
import { AdService } from './v1/services/ad.service';


@Module({
  imports: [
    AuthV1Module
  ],
  exports: [
    AuthV1Module
  ],
  providers: [],
})
export class AuthModule { }
