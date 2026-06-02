import { User } from "@auth/interfaces/user.interface";

export interface UsersResponse {
  count: number;
  pages: number;
  users: User[];
}


 