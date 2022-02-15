import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CsvParser } from 'nest-csv-parser';
import { AuthModule } from '../auth/auth.module';
import { ExtractTokenMiddleware } from '../core/middleware/extract-token.middleware';
import { AuthSchema } from '../core/schemas/auth.schema';
import { MailSenderService } from '../core/services/mailsender.service';
import { AnalyticsV1Controller } from './controllers/analytics-v1.controller';
import { CardsV1Controller } from './controllers/cards-v1.controller';
import { EntitiesV1Controller } from './controllers/entitities-v1.controller';
import { LogsV1Controller } from './controllers/logs-v1.controller';
import { MovementsV1Controller } from './controllers/movements-v1.controller';
import { UsersV1Controller } from './controllers/users-v1.controller';
import { CardSchema } from './schemas/card.schema';
import { EntitySchema } from '../auth/v1/schemas/entity.schema';
import { LogSchema } from './schemas/log.schema';
import { MovementSchema } from './schemas/movement.schema';
import { ReadingSchema } from './schemas/reading.schema';
import { CardService } from './services/card.service';
import { LogService } from './services/log.service';
import { MovementService } from './services/movement.service';
import { ParseService } from './services/parser.service';
import { ReadingService } from './services/reading.service';
import { UserService } from './services/user.service';
import { GunsV1Controller } from './controllers/guns-v1.controller';
import { GunService } from './services/gun.service';
import { GunsSchema } from './schemas/guns.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
    MongooseModule.forFeature([{ name: 'Card', schema: CardSchema }]),
    MongooseModule.forFeature([{ name: 'Gun', schema: GunsSchema }]),
    MongooseModule.forFeature([{ name: 'Movement', schema: MovementSchema }]),
    MongooseModule.forFeature([{ name: 'Reading', schema: ReadingSchema }]),
    MongooseModule.forFeature([{ name: 'Log', schema: LogSchema }]),
    AuthModule
  ],
  controllers: [CardsV1Controller, EntitiesV1Controller, LogsV1Controller, MovementsV1Controller, UsersV1Controller, AnalyticsV1Controller,  ],
  providers: [MailSenderService, UserService, CardService, ReadingService, MovementService, LogService, CsvParser, ParseService, ]
})
export class FZtrackerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtractTokenMiddleware).forRoutes(CardsV1Controller, EntitiesV1Controller, LogsV1Controller, MovementsV1Controller, UsersV1Controller,GunsV1Controller );
  }
}
