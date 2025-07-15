import { IsNotEmpty, IsString } from 'class-validator';

export class LoginReqDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
