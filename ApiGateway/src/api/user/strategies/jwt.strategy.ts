import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Request } from 'express';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService<AllConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('app.accessTokenPublicKey', {
        infer: true,
      }),
      passReqToCallback: true, // Truyền request vào validate()
    });
  }

  async validate(
    request: Request, // Nhận request để lấy headers
    payload: { username: string; sub: string; roles: string[] },
  ) {
    const deviceId = request.headers['device-id'];

    if (!deviceId) {
      throw new UnauthorizedException('Device miss match');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
