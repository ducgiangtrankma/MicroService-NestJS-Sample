import { Request } from 'express';
import { PayloadContext } from './inter-service.interface';

export interface JwtPayload extends PayloadContext {
  userId: string;
  username: string;
  roles: string;
}

export interface JwtRequest extends Request {
  user: JwtPayload;
}
