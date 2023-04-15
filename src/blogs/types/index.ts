import { Blog } from '@prisma/client';

export type BlogViewModel = Omit<Blog, 'bloggerId'>;

export interface BlogWithBannInfoModel extends Blog {
  bannedBlogs: {
    isBanned: boolean;
    banDate: string | null;
  } | null;
}
