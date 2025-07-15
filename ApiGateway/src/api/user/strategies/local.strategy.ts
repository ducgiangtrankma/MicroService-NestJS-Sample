import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local-auth') {
  constructor() {
    super({
      usernameField: 'username', // Đổi field thành phoneNumber
      passwordField: 'password',
    });
  }
  async validate(phoneNumber: string, password: string): Promise<any> {
    return {
      phoneNumber,
      password,
    };
  }
}
