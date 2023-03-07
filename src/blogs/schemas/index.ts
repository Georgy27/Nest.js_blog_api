export interface IBlogOwnerInfo {
  userId: string;
  userLogin: string;
}
export interface IBannedUsersInfo {
  id: string;
  login: string;
  banInfo: IBanInfo;
}
interface IBanInfo {
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
}
