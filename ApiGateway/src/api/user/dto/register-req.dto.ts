import { IsNotEmpty } from 'class-validator';
import { IsPassword } from 'src/decorators/is-password.decorator';

export class RegisterReqDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsPassword()
  password: string;
}
