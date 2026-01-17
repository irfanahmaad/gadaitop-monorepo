import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const { data, meta } = response || {};

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data,
          meta,
        };
      }),
    );
  }
}
