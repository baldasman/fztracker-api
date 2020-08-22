
import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import getRoutesTree from './config/routes';
import { AdminDocumentation } from './modules/admin/admin.swagger';
import { AuthDocumentation } from './modules/auth/auth.swagger';
import { SwaggerOptionsHelper } from './modules/core/helpers/swagger-options.helper';
import { TimeoutInterceptor } from './modules/core/interceptors/timeout.interceptor';
import { FZtrackerDocumentation } from './modules/fztracker/fztracker.swagger';

const http = require('http');
const socketIO = require('socket.io');

async function bootstrap() {
  

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.use(helmet());
  app.useLogger(app.get(Logger));
  app.useStaticAssets(join(__dirname, '/../assets'));
  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
      const final = {
        errors: errors.map(error => {
          const _return = {};
          _return[error.property] =
              error.constraints[Object.keys(error.constraints)[0]];
          return _return;
        })

      };
      
      return final;
    }
  }));

  const customCss = SwaggerOptionsHelper.getDefaultImage();
  const routesTree = getRoutesTree();
  const swaggerCustomization = {
    customCss,
    customSiteTitle: 'FZTracker API',
    customfavIcon: '/assets/images/favicon.ico'
  };

  AdminDocumentation.init(app, routesTree, swaggerCustomization);
  AuthDocumentation.init(app, routesTree, swaggerCustomization);
  FZtrackerDocumentation.init(app, routesTree, swaggerCustomization);

  // Setup websockets
const wsPort = 8081;
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
	socket.on('subscribe', (channelId) => {
	  console.log('subscribe', `sock=${socket.id} channel=${channelId}`);
    socket.join(channelId);
    socket.emit(channelId);
	});
  
	socket.on('publish', (event) => {
	  console.log('publish', `event=${event.data.type} value=${event.data.data.value}`);
	  io.sockets.in(event.channelId).emit('publish', event.data);
	});
  
	socket.on('unsubscribe', (channelId) => {
	  console.log('unsubscribe', `sock=${socket.id} channel=${channelId}`);
	  socket.leave(channelId);
	});
  
	socket.on('disconnect', () => {
	  console.log('disconnect', `sock=${socket.id}`);
	});
});

global['io'] = io;

server.listen(wsPort, () => {
    console.log('ws listen', `port ${wsPort} `);
  });
  
  app.get(Logger).log(`Running on port ${environment.port}`);
  await app.listen(environment.port);
}

bootstrap();
