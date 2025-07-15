import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsPassword } from 'src/decorators/is-password.decorator';

export class RegisterReqDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '0339488855',
    description: 'Username',
  })
  username: string;

  @IsNotEmpty()
  @IsPassword()
  @ApiProperty({
    example: '1234567a',
    description: 'Password',
  })
  password: string;
}
