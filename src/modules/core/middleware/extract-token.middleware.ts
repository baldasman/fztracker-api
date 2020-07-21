import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ExtractTokenMiddleware implements NestMiddleware {
  use(req, res, next) {
    if (!req.headers || !req.headers?.authorization) {
      return next();
    }

    const parted = req.headers.authorization.split(' ');
    if (parted.length !== 2) {
      return next();
    }

    req.token = parted[1];
    return next();
  }
}
