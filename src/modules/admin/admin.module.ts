import { Module } from '@nestjs/common';
import { MongooseHealthIndicator } from '@nestjs/terminus';

import { AdminController } from './admin.controller';
import { MailSenderService } from '../core/services/mailsender.service';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthSchema } from '../core/schemas/auth.schema';
import { UserService } from '../fztracker/services/user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }])],
  controllers: [AdminController],
  providers: [MongooseHealthIndicator, MailSenderService, UserService],
  exports: [
  ]
})
export class AdminModule { }
