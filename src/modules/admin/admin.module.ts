import { Module } from '@nestjs/common';
import { MongooseHealthIndicator } from '@nestjs/terminus';

import { AdminController } from './admin.controller';
import { MailSenderService } from '../core/services/mailsender.service';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthSchema } from '../core/schemas/auth.schema';
import { UserService } from '../fztracker/services/user.service';
import { AdService } from '../auth/v1/services/ad.service';
import { AuthV1Module } from '../auth/v1/auth-v1.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]), AuthModule],
  controllers: [AdminController],
  providers: [MongooseHealthIndicator, MailSenderService, UserService],
  exports: [
  ]
})
export class AdminModule { }
