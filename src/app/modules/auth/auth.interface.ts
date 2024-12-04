import { USER_ROLE } from "../user/user.constant";

export type TLoginUser = {
  email: string;
  password: string;
};

export type TUserRole = keyof typeof USER_ROLE;

export interface ILoginWithGoogle {
  name: string;
  email: string;
  profile_image?: string;
  inviteToken?: string;
  username?: string;
  phone?: string;
}
