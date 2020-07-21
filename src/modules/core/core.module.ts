import { APP_FILTER } from '@nestjs/core';
import { HttpModule, Module, Global } from '@nestjs/common';

import { Logger } from '@nestjs/common';

// Services.


// Interceptors.

// Filters.
import { ExceptionsFilter } from './filters/exceptions.filter';


@Global() // This will make this module available globaly! This should only be done on this CoreModule!
@Module({
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter
    }
  ],
  imports: [
    HttpModule
  ],
  exports: [
    HttpModule,
    Logger
  ]
})
export class CoreModule { }
