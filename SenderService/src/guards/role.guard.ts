import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from 'src/constants/app.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Nếu không có @Roles thì API này không yêu cầu quyền hạn
    }

    const request = context.switchToHttp().getRequest<any>();
    const user = request.user; // Giả sử `user` được gán từ `JwtAuthGuard`

    return user?.roles?.some((role: string) => requiredRoles.includes(role));
  }
}
