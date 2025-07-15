import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { InterServiceClient } from 'src/libs/inter-service-client';
import { InterServiceCall } from 'src/utils/inter-service-error.handler';
import { RegisterReqDto } from './dto/register-req.dto';
import { LoginReqDto } from './dto/login-req.dto';
import { PayloadContext } from 'src/common/inter-service.interface';

@Injectable()
export class UserService {
  private readonly userServiceHost: string;

  constructor(
    private readonly interServiceClient: InterServiceClient,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.userServiceHost = configService.getOrThrow('app.userServiceHost', {
      infer: true,
    });
  }

  @InterServiceCall('UserService', 'Api-Gateway')
  async register(body: RegisterReqDto) {
    const response = await this.interServiceClient.post(
      '/auth/register',
      this.userServiceHost,
      body,
    );
    return response.data;
  }

  @InterServiceCall('UserService', 'Api-Gateway')
  async login(body: LoginReqDto) {
    const response = await this.interServiceClient.post(
      '/auth/login',
      this.userServiceHost,
      body,
    );
    return response.data;
  }

  @InterServiceCall('UserService', 'Api-Gateway')
  async getProfile(userId: string, payload: PayloadContext) {
    const response = await this.interServiceClient.get(
      `/user/${userId}`,
      this.userServiceHost,
      payload,
    );
    return response.data;
  }

  @InterServiceCall('UserService', 'Api-Gateway')
  async activeOnline(userId: string, payload: PayloadContext) {
    const response = await this.interServiceClient.post(
      `/user/online`,
      this.userServiceHost,
      {},
      payload,
    );
    return response.data;
  }

  @InterServiceCall('UserService', 'Api-Gateway')
  async disableOnline(userId: string, payload: PayloadContext) {
    const response = await this.interServiceClient.post(
      `/user/offline`,
      this.userServiceHost,
      {},
      payload,
    );
    return response.data;
  }
}
