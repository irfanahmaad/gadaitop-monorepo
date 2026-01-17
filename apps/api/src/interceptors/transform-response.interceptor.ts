import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
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
          // instanceToPlain respects @Exclude() decorators when called on class instances
          // If data is already plain (from ClassSerializerInterceptor), it will pass through
          data: data ? instanceToPlain(data, { excludeExtraneousValues: false }) : data,
          meta: meta ? instanceToPlain(meta, { excludeExtraneousValues: false }) : meta,
        };
      }),
    );
  }
}
