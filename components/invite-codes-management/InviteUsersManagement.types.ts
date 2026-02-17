import { User } from "@/lib/users/users.types";

export type InviteUsersManagementProps = {
  users: User[] | null;
  loggedInUser: User;
};

export type ExtendedUser = User & { tempRole?: string };
