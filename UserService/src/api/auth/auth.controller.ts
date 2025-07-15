import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { I18nService } from 'nestjs-i18n';
import { AppRequest } from 'src/common/app.request';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { AccountLoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/register')
  register(@Body() registerReqDto: RegisterReqDto) {
    return this.authService.register(registerReqDto);
  }

  @Post('/login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: AppRequest): Promise<AccountLoginResDto> {
    return this.authService.login(req.user);
  }
}
