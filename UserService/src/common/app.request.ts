import { Request } from 'express';
import { User } from 'src/api/auth/schema/user.schema';

export interface AppRequest extends Request {
  user: User;
  deviceId: string;
}

export interface InternalJwtRequest extends Request {
  user: {
    userId: string;
    phoneNumber: string;
    roles: string[];
  };
  deviceId: string;
}
