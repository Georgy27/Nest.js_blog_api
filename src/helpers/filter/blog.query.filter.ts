import { Prisma } from '@prisma/client';
export type BlogFilter = Prisma.BlogWhereInput;
export const blogQueryFilter = (
  searchNameTerm?: string | null,
  userId?: string | undefined,
): BlogFilter => {
  if (searchNameTerm && userId) {
    return {
      AND: [
        {
          name: {
            contains: searchNameTerm ?? '',
            mode: 'insensitive',
          },
        },
        {
          bloggerId: {
            contains: userId ?? '',
          },
        },
        {
          bannedBlogs: {
            isBanned: false,
          },
        },
      ],
    };
  }
  if (searchNameTerm) {
    return {
      AND: [
        {
          name: {
            contains: searchNameTerm ?? '',
            mode: 'insensitive',
          },
        },
        {
          bannedBlogs: {
            isBanned: false,
          },
        },
      ],
    };
  }
  if (userId) {
    return {
      AND: [
        {
          bloggerId: {
            contains: userId ?? '',
          },
        },
        {
          bannedBlogs: {
            isBanned: false,
          },
        },
      ],
    };
  }
  return {
    bannedBlogs: {
      isBanned: false,
    },
  };
};
