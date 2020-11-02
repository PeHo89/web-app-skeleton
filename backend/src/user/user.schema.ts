import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  _id?: string;
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  // @Prop()
  // dateOfBirth: Date;
  // @Prop()
  // streetAndNumber: string;
  // @Prop()
  // postalCode: string;
  // @Prop()
  // city: string;
  // @Prop()
  // country: string;
  @Prop()
  email: string;
  @Prop()
  passwordHash?: string;
  // @Prop()
  // accessToken: string;
  // @Prop()
  // telephone: string;
  // @Prop()
  // description: string;
  // @Prop()
  // imageLink: string;
  // @Prop()
  // isActive: boolean;
  // @Prop()
  // creationTime: Date;
  // @Prop()
  // doubleOptIn: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
