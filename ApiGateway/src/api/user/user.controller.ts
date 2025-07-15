import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { InterServiceClient } from 'src/libs/inter-service-client';
import { ResponseHelper } from 'src/common/response.helper';
import { LoginReqDto } from './dto/login-req.dto';
import { RegisterReqDto } from './dto/register-req.dto';
import { UserService } from './user.service';
import { JwtRequest } from 'src/common/app.request';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly interServiceClient: InterServiceClient,
  ) {}

  @Post('/register')
  @Public()
  @HttpCode(201)
  async register(
    @Body()
    body: RegisterReqDto,
  ) {
    const response = await this.userService.register(body);
    return ResponseHelper.success(response, 'Register success');
  }

  @Post('/login')
  @Public()
  @HttpCode(200)
  async login(
    @Body()
    body: LoginReqDto,
  ) {
    const response = await this.userService.login(body);
    return ResponseHelper.success(response, 'Login success');
  }

  @Get(':id')
  getProfile(@Request() request: JwtRequest, @Param('id') id: string) {
    return this.userService.getProfile(id, request.user);
  }

  @Post('/online')
  activeOnline(@Request() request: JwtRequest) {
    return this.userService.activeOnline(request.user.userId, request.user);
  }

  @Post('/offline')
  disableOnline(@Request() request: JwtRequest) {
    return this.userService.disableOnline(request.user.userId, request.user);
  }
}
