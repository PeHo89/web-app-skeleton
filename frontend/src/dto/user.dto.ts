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

export interface UserDto {
  id: string;
  email: string;
  accessToken: string;
  roles: string[];
  personalInformation: PersonalInformation;
  personalSettings: PersonalSettings;
}
