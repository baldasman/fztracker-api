import { Module } from '@nestjs/common';

import { AuthV1Module } from './v1/auth-v1.module';

@Module({
  imports: [
    AuthV1Module
  ],
  exports: [
    AuthV1Module
  ]
})
export class AuthModule { }
