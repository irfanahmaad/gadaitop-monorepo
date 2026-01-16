import {
  applyDecorators,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AuthGuard } from '../guards/auth.guard';
import { PermissionsGuard } from '../guards/permission.guard';
import { AuthUserInterceptor } from '../interceptors/auth-user.interceptor';
import type { IAbility } from '../interfaces/IAbility';
import { CheckPermissions } from './permission.decorator';
import { PublicRoute } from './public-route.decorator';

export function Auth(
  permissions: IAbility[] = [],
  options?: Partial<{ public: boolean }>,
): MethodDecorator {
  const isPublicRoute = options?.public ?? false;

  return applyDecorators(
    UseGuards(AuthGuard({ public: isPublicRoute }), PermissionsGuard),
    CheckPermissions(...permissions),
    UseInterceptors(AuthUserInterceptor),
    PublicRoute(isPublicRoute),
  );
}
