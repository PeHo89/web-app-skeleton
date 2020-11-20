import { Exclude, Expose } from 'class-transformer';

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
}
