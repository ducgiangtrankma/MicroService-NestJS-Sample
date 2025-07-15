import { Injectable } from '@nestjs/common';
import { User } from '../auth/schema/user.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRedisService } from 'src/libs/redis/user-redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly userRedisService: UserRedisService,
  ) {}
  async getProfile(id: string) {
    const response = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
    });
    return response;
  }

  async updateProfile(id: string, body: UpdateUserDto) {
    const newUser = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      {
        password: body.password,
      },
      {
        returnDocument: 'after',
      },
    );
    await this.userRedisService.setKey(
      `user:${newUser._id.toString()}`,
      JSON.stringify(newUser),
    );
    return newUser;
  }

  async activeOnline(userId: string) {
    await this.userRedisService.setOnline(userId);
    await this.userRedisService.publishEvent('presence-online', { userId });
    return 'Success';
  }

  async disableOnline(userId: string) {
    await this.userRedisService.delOnline(userId);
    await this.userRedisService.publishEvent('presence-offline', { userId });
    return 'Success';
  }

  async getListUser() {
    return await this.userModel.find();
  }
}
