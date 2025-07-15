import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class User {
  // Khai báo `_id` trong schema
  readonly _id: Types.ObjectId;
  @Prop({ required: true, trim: true })
  username: string;
  @Prop({ required: true, trim: true })
  password: string;
  @Prop({ type: [String], default: ['user'] })
  roles: string[]; // Vai trò của user - default user
}
export const UserSchema = SchemaFactory.createForClass(User);
