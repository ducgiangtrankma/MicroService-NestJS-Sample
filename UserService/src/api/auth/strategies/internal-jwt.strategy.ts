import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class InternalJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService<AllConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('app.assessTokenInternalPublickey', {
        infer: true,
      }),
      passReqToCallback: true, // Truyền request vào validate()
    });
  }

  async validate(
    request: Request,
    payload: {
      requestFrom?: string;
      userId: string;
      username: string;
      roles: string;
      iat: number;
      exp: number;
    },
  ) {
    return {
      userId: payload.userId,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
