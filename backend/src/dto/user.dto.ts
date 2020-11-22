import { Exclude, Expose } from 'class-transformer';

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  streetAndNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

@Exclude()
export class UserDto {
  @Expose()
  id: string;
  @Expose()
  email: string;
  @Expose()
  accessToken: string;
  @Expose()
  roles: string[];
  @Expose()
  personalInformation: PersonalInformation;
}
