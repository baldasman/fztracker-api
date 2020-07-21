import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import MongooseConfig from './config/mongoose-config';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { FZtrackerModule } from './modules/fztracker/fztracker.module';


@Module({
  imports: [
    CoreModule, AdminModule, AuthModule, FZtrackerModule,
    MongooseModule.forRootAsync({useClass: MongooseConfig})
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
