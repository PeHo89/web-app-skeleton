import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export interface DoubleOptInDetails {
  doubleOptInSentTimestamp: string;
  doubleOptInConfirmedTimestamp: string;
  doubleOptInToken: string;
}

@Schema()
export class User extends Document {
  @Prop()
  email: string;
  @Prop()
  passwordHash: string;
  @Prop()
  doubleOptInDetails?: DoubleOptInDetails;
  @Prop()
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
