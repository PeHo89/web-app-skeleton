import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

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
  @Prop()
  personalInformation: PersonalInformation;
  @Prop()
  personalSettings: PersonalSettings;
}

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

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  streetAndNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface PersonalSettings {
  newsletterSubscription: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
