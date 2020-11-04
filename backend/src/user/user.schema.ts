import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop()
  email: string;
  @Prop()
  passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
