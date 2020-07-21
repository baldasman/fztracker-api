import {CanActivate, ExecutionContext, HttpService, Injectable, Logger} from '@nestjs/common';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';


@Injectable()
export class AuthGuard implements CanActivate {
  private loggerContext = 'AuthGuard';
  constructor(
      private readonly httpService: HttpService,
      private readonly logger: Logger) {}

  canActivate(context: ExecutionContext): boolean
      |Promise<boolean>|Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    let authorization;

    // Try to find header with authorization
    if (request.headers && request.headers.authorization) {
      authorization = request.headers.authorization;

      if (!authorization) {
        this.logger.error(
            `Authorization header not found ${JSON.stringify(request.headers)}`,
            this.loggerContext);
        return false;
      }
  
      const regex = /^Bearer\s([^.]+(?:\.[^.]+){2})$/gm;
  
      if (!regex.test(authorization)) {
        this.logger.error(
            `Authorization header doesn\'t match regex ${authorization}`,
            this.loggerContext);
        return false;
      }
    } 
    // Try ti find query param with token
    else if(request.query.token) {
      authorization = 'Bearer ' + request.query.token;
    }

    const headers = {authorization};

    return this.httpService
        .get(`http://localhost:${process.env.PORT}/auth/v1/token`, {headers})
        .pipe(
            catchError(err => {
              return throwError(err);
            }),
            mergeMap(res => {
              return of(res);
            }),
            map(
                res => {
                  if (res.data.data) {
                    request.context = res.data.data;
                  }
                  return true;
                },
                () => {
                  return false;
                }));
  }
}
