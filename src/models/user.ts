import { BaseEntity } from './base';

export interface User extends BaseEntity {
  userName: string;
  email: string;
  password?: string;
  profilePicture: string;
  otp?: string;
  isVerified: boolean;
}
