import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Types } from 'mongoose';

export class UserResDto {
  @Expose()
  _id: Types.ObjectId;

  @Expose()
  @ApiProperty({
    example: 'username',
    description: 'username',
  })
  username: string;

  @Expose()
  @ApiProperty({
    example: ['admin'],
    enum: ['admin', 'user', 'moderator'], // Danh sách role hợp lệ
    isArray: true,
  })
  roles: string[];
}

@Exclude()
export class AccountLoginResDto {
  @ApiProperty({ type: UserResDto, description: 'Thông tin người dùng' })
  data: UserResDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken: string;
}
