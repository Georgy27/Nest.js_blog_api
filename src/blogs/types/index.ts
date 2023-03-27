import { Blog } from '@prisma/client';

export type BlogViewModel = Omit<Blog, 'bloggerId'>;
