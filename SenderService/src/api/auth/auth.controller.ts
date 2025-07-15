import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { AccountLoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { LoginReqDto } from './dto/login.req.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterReqDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error.',
  })
  register(@Body() registerReqDto: RegisterReqDto) {
    return this.authService.register(registerReqDto);
  }

  @Post('/login')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with user and password' })
  @ApiBody({ type: LoginReqDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login success',
    type: AccountLoginResDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Login Error',
  })
  @UseGuards(LocalAuthGuard)
  async login(@Request() req): Promise<AccountLoginResDto> {
    return this.authService.login(req.user);
  }

  @Get('/get-verify-jwt')
  @ApiBearerAuth() // Yêu cầu Bearer Token trong Swagger
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Get success',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getApiJWT() {
    return 'Get jwt success';
  }

  @Get('/get-verify-admin')
  @Roles('admin')
  getApiRole() {
    return 'Get admin success';
  }
}
