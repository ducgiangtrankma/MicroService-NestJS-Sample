import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { AllConfigType } from 'src/config/config.type';
import { ErrorMessages } from 'src/constants/error-key.constant';
import { AccountLoginResDto, UserResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { User } from './schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly jwtService: JwtService,
  ) {}

  private async syncToken(
    tokenPayload: {
      username: string;
      sub: Types.ObjectId;
      roles: string[];
    },
    refreshTokenPayload: {
      username: string;
      sub: Types.ObjectId;
    },
  ): Promise<{
    token: string;
    refreshToken: string;
  }> {
    const token = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('app.accessTokenKey', {
        infer: true,
      }),
      expiresIn: this.configService.getOrThrow('app.accessTokenExpires', {
        infer: true,
      }),
    });
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.getOrThrow('app.refreshTokenKey', {
        infer: true,
      }),
      expiresIn: this.configService.getOrThrow('app.refreshTokenExpires', {
        infer: true,
      }),
    });

    return {
      token: token,
      refreshToken: refreshToken,
    };
  }

  async register(registerReqDto: RegisterReqDto) {
    try {
      const { username } = registerReqDto;
      const existingUser = await this.userModel.findOne({ username }).exec();
      if (existingUser) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: ErrorMessages.Register_PhoneHasRegistered,
            data: null,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const newUser = new this.userModel({
        ...registerReqDto,
      });
      return await newUser.save();
    } catch (error) {
      throw error;
    }
  }

  async validateUser(username: string) {
    try {
      const user = await this.userModel
        .findOne({
          username: username,
        })
        .exec();
      if (!user) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: ErrorMessages.UserNotFound,
            data: null,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(user: User): Promise<AccountLoginResDto> {
    try {
      const token_payload = {
        username: user.username,
        sub: user._id,
        roles: user.roles,
      };
      const refreshToken_payload = {
        username: user.username,
        sub: user._id,
      };
      const syncToken = await this.syncToken(
        token_payload,
        refreshToken_payload,
      );
      return {
        data: plainToInstance(UserResDto, user, {
          excludeExtraneousValues: true,
        }),
        accessToken: syncToken.token,
        refreshToken: syncToken.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
