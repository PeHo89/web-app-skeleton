import axios from "axios";
import { LoginDto } from "@/dto/login.dto";
import { AccessTokenDto } from "@/dto/accessToken.dto";

export class AuthenticationService {
  static basePath = "authentication";
  static authenticationService: AuthenticationService;

  static getSingletonInstance(): AuthenticationService {
    if (!AuthenticationService.authenticationService) {
      AuthenticationService.authenticationService = new AuthenticationService();
    }
    return AuthenticationService.authenticationService;
  }

  async login(loginDto: LoginDto): Promise<AccessTokenDto | null> {
    try {
      const result = await axios.post(
        `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${AuthenticationService.basePath}/login`,
        loginDto
      );
      return result.data as AccessTokenDto;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    }
  }
}
