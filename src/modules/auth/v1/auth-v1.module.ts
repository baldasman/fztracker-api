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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
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
    VerifyTokenService
  ],
  exports: []
})
export class AuthV1Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExtractTokenMiddleware)
      .forRoutes(AuthV1Controller);
  }
}