import axios from "axios";
import { UserDto } from "@/dto/user.dto";

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

  async getUserProfileImage(): Promise<any> {
    try {
      const result = await axios.get(
        `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/image`
      );
      return result.data;
    } catch (error) {
      console.error("Get user profile image failed", error);
      return null;
    }
  }
}
