import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/decorators/role.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { InternalJwtRequest } from 'src/common/app.request';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //User
  @Get(':id')
  getProfile(@Request() request: InternalJwtRequest, @Param('id') id: string) {
    return this.userService.getProfile(id);
  }
  @Put(':id')
  async updateProfile(
    @Request() request: InternalJwtRequest,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.updateProfile(id, body);
  }

  @Post('/online')
  activeOnline(@Request() request: InternalJwtRequest) {
    return this.userService.activeOnline(request.user.userId);
  }

  @Post('/offline')
  disableOnline(@Request() request: InternalJwtRequest) {
    return this.userService.disableOnline(request.user.userId);
  }

  //Admin
  @Get('')
  @Roles('admin')
  getListUser() {
    return this.userService.getListUser();
  }
}
