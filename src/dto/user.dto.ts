export interface CreateUserDto {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  profilePicture: string;
}

export interface LoginUser {
  email: string;
  password: string;
}
