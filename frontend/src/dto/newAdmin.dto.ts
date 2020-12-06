import { NewUserDto } from "./newUser.dto";

export interface NewAdminDto extends NewUserDto {
  adminSecret: string;
}
