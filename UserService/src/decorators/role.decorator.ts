import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from 'src/constants/app.constant';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
