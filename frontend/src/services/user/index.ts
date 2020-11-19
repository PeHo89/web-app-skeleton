import axios from "axios";
import { UserDto } from "@/dto/user.dto";
import { LoginDto } from "@/dto/login.dto";
import { AccessTokenDto } from "@/dto/accessToken.dto";
import { User } from "../../../../backend/src/user/user.schema";
import { NewUserDto } from "@/dto/newUser.dto";

export class UserService {
  static basePath = "user";
  static userService: UserService;

  static getSingletonInstance(): UserService {
    if (!UserService.userService) {
      UserService.userService = new UserService();
    }
    return UserService.userService;
  }

  async getUserProfile(accessToken: string): Promise<UserDto | null> {
    try {
      const result = await axios.get(
        `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return result.data as UserDto;
    } catch (error) {
      console.error("Get user profile failed", error);
      return null;
    }
  }

  async getUserProfileImage(accessToken: string): Promise<string | null> {
    try {
      const result = await axios.get(
        `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/image`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return result.data;
    } catch (error) {
      console.error("Get user profile image failed", error);
      return null;
    }
  }

  async signUp(signUpDto: NewUserDto): Promise<UserDto | null> {
    try {
      const result = await axios.post(
        `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}`,
        signUpDto
      );
      return result.data as UserDto;
    } catch (error) {
      console.error("Sign up failed", error);
      return null;
    }
  }
}
