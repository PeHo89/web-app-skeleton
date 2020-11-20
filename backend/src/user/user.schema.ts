import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export interface DoubleOptInDetails {
  doubleOptInSentTimestamp: string;
  doubleOptInConfirmedTimestamp: string;
  doubleOptInToken: string;
}

export interface SetNewPasswordDetails {
  setNewPasswordSentTimestamp: string;
  setNewPasswordConfirmedTimestamp: string;
  setNewPasswordToken: string;
  setNewPasswordInProgress: boolean;
}

@Schema()
export class User extends Document {
  @Prop()
  email: string;
  @Prop()
  passwordHash: string;
  @Prop()
  doubleOptInDetails: DoubleOptInDetails;
  @Prop()
  roles: string[];
  @Prop()
  active: boolean;
  @Prop()
  setNewPasswordDetails: SetNewPasswordDetails;
}

export const UserSchema = SchemaFactory.createForClass(User);
