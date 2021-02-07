import axios from "axios";
import { PersonalInformation, PersonalSettings, UserDto } from "@/dto/user.dto";
import { NewUserDto } from "@/dto/newUser.dto";
import { EmailDto } from "@/dto/email.dto";
import { PasswordDto } from "@/dto/password.dto";
import { UpdatePasswordDto } from "@/dto/updatePassword.dto";
import { UpdateEmailDto } from "@/dto/updateEmail.dto";
import { SubscriptionDto } from "@/dto/subscription.dto";
import { NewSubscriptionSessionDto } from "@/dto/newSubscriptionSessionDto";
import { NewSubscriptionDto } from "@/dto/newSubscription.dto";

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

  async updateEmail(
    accessToken: string,
    updateEmailDto: UpdateEmailDto
  ): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/email`,
      updateEmailDto,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data as string;
  }

  async updatePassword(
    accessToken: string,
    updatePasswordDto: UpdatePasswordDto
  ): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/password`,
      updatePasswordDto,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data as string;
  }

  async updatePersonalInformation(
    accessToken: string,
    personalInformation: PersonalInformation
  ): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/personalinformation`,
      personalInformation,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data as string;
  }

  async updatePersonalSettings(
    accessToken: string,
    personalSettings: PersonalSettings
  ): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/personalsettings`,
      personalSettings,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data as string;
  }

  async confirmEmail(userId: string, token: string): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/confirm?userId=${userId}&token=${token}`
    );
    return result.data as string;
  }

  async getAvailableSubscriptions(): Promise<SubscriptionDto[]> {
    const result = await axios.get(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/subscription`
    );
    return result.data as SubscriptionDto[];
  }

  async newSubscription(
    accessToken: string,
    newAboSubscriptionDto: NewSubscriptionDto
  ): Promise<NewSubscriptionSessionDto> {
    const result = await axios.post(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/subscription`,
      newAboSubscriptionDto,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data as NewSubscriptionSessionDto;
  }

  async confirmSubscription(
    accessToken: string,
    sessionId: string
  ): Promise<string> {
    const result = await axios.put(
      `${process.env.VUE_APP_BACKEND_PROTOCOL}://${process.env.VUE_APP_BACKEND_HOST}:${process.env.VUE_APP_BACKEND_PORT}/${UserService.basePath}/profile/subscription/confirm?session_id=${sessionId}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return result.data as string;
  }
}
