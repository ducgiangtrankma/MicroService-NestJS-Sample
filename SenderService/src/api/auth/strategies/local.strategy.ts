import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ErrorMessages } from 'src/constants/error-key.constant';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local-auth') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username', // Đổi field thành phoneNumber
      passwordField: 'password',
    });
  }
  async validate(username: string): Promise<any> {
    const user = await this.authService.validateUser(username);
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: ErrorMessages.SigIn_Error,
          data: null,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return user;
  }
}
