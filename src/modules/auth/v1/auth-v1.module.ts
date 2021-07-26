import { Module, HttpModule, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthV1Controller } from './auth-v1.controller';

import { ExtractTokenMiddleware } from '../../core/middleware/extract-token.middleware';

import { VerifyTokenService } from './services/verify-token.service';

import { SignInService } from './services/sign-in.service';
import { AuthsService } from './services/auths.service';
import { DecodeTokenService } from './services/decode-token.service';
import { SessionsService } from './services/sessions.service';
import { SignUpService } from './services/sign-up.service';
import { ResendConfirmAccountEmailService } from './services/resend-confirm-account-email.service';
import { ChangePasswordService } from './services/change-password.service';
import { ConfirmAccountService } from './services/confirm-account.service';
import { RecoverPasswordService } from './services/recover-password.service';
import { LogoutService } from './services/logout.service';

import { SessionSchema } from './schemas/session.schema';
import { AuthSchema } from '../../core/schemas/auth.schema';
import { AdService } from './services/ad.service';
import { EntitySchema } from './schemas/entity.schema';
import { EntityService } from './services/entity.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
    MongooseModule.forFeature([{ name: 'Entity', schema: EntitySchema }]),
  ],
  controllers: [
    AuthV1Controller
  ],
  providers: [
    AuthsService,
    ChangePasswordService,
    ConfirmAccountService,
    DecodeTokenService,
    LogoutService,
    RecoverPasswordService,
    ResendConfirmAccountEmailService,
    SignInService,
    SignUpService,
    SessionsService,
    VerifyTokenService,
    AdService,
    EntityService
  ],
  exports: [
    AdService, 
    EntityService
  ]
})
export class AuthV1Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExtractTokenMiddleware)
      .forRoutes(AuthV1Controller);
  }
}