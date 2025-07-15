import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
  ) {}

  async genInternalToken(tokenPayload: {
    requestFrom: string;
    payload?: Record<string, string>;
  }): Promise<string> {
    const internalToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('app.internalTokenPrivateKey', {
        infer: true,
      }),
      expiresIn: this.configService.getOrThrow('app.accessTokenExpires', {
        infer: true,
      }),
      algorithm: 'RS256',
    });

    return internalToken;
  }
}
