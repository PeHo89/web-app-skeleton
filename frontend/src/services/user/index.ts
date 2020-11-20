import axios from "axios";
import { UserDto } from "@/dto/user.dto";
import { NewUserDto } from "@/dto/newUser.dto";
import { EmailDto } from "@/dto/email.dto";
import { PasswordDto } from "@/dto/password.dto";

export class UserService {
  static basePath = "user";
  static userService: UserService;

  static getSingletonInstance(): UserService {
    if (!UserService.userService) {
      UserService.userService = new UserService();
    }
    return UserService.userService;
  }

  async getUserProfile(accessToken: string): Promise<UserDto> {
    const result = await axios.get(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data as UserDto;
  }

  async getUserProfileImage(accessToken: string): Promise<string> {
    const result = await axios.get(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/image`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data;
  }

  async signUp(signUpDto: NewUserDto): Promise<UserDto> {
    const result = await axios.post(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}`,
      signUpDto
    );
    return result.data as UserDto;
  }

  async resetPassword(emailDto: EmailDto): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/resetpassword`,
      emailDto
    );
    return result.data as string;
  }

  async setNewPassword(
    userId: string,
    token: string,
    passwordDto: PasswordDto
  ): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/setnewpassword?userId=${userId}&token=${token}`,
      passwordDto
    );
    return result.data as string;
  }
}
