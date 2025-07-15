import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RequireDeviceId = (required: boolean = true) => {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata('requireDeviceId', required, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class DeviceIdGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // // Kiểm tra nếu route là public thì bỏ qua device-id check
    // const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);
    // console.log('isPublic', isPublic);
    // if (isPublic) {
    //   return true;
    // }

    const requireDeviceId = this.reflector.get<boolean>(
      'requireDeviceId',
      context.getHandler(),
    );

    // Nếu route không yêu cầu device-id, cho phép đi qua
    if (requireDeviceId === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const deviceId = request.headers['device-id'] || request.body.deviceId;
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    // Gán deviceId vào request để có thể sử dụng trong controllers
    request.deviceId = deviceId;

    return true;
  }
}
