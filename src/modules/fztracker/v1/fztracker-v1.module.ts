import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtractTokenMiddleware } from '../../core/middleware/extract-token.middleware';
import { AuthSchema } from '../../core/schemas/auth.schema';
import { MailSenderService } from '../../core/services/mailsender.service';
import { FZtrackerV1Controller } from './fztracker-v1.controller';
import { CardSchema } from './schemas/card.schema';
import { EntitySchema } from './schemas/entity.schema';
import { CardService } from './services/card.service';
import { UserService } from './services/user.service';
import { EntityService } from './services/entity.service';


@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Auth', schema: AuthSchema}]),
    MongooseModule.forFeature([{name: 'Card', schema: CardSchema}]),
    MongooseModule.forFeature([{name: 'Entity', schema: EntitySchema}]),
  ],
  controllers: [FZtrackerV1Controller],
  providers:
      [MailSenderService, UserService, CardService, EntityService],
  exports: []
})
export class FZtrackerV1Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtractTokenMiddleware).forRoutes(FZtrackerV1Controller);
  }
}