import { banStatusEnumKeys } from '../pagination/dto/users.pagination.query.dto';
import { Prisma } from '@prisma/client';

export type UserFilter = Prisma.UserWhereInput;

export const userQueryFilter = (
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
  banStatus: banStatusEnumKeys,
): UserFilter => {
  const banStatusFilterValue =
    banStatus === 'all' ? {} : banStatus === 'banned' ? true : false;

  if (searchLoginTerm && searchEmailTerm) {
    return {
      AND: [
        {
          OR: [
            {
              login: {
                contains: searchLoginTerm ?? '',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: searchEmailTerm ?? '',
                mode: 'insensitive',
              },
            },
          ],
        },
        banStatus === 'all'
          ? {}
          : {
              banInfo: {
                isBanned: banStatusFilterValue,
              },
            },
      ],
    };
  }

  if (searchLoginTerm) {
    return {
      AND: [
        {
          login: {
            contains: searchLoginTerm ?? '',
            mode: 'insensitive',
          },
        },
        banStatus === 'all'
          ? {}
          : {
              banInfo: {
                isBanned: banStatusFilterValue,
              },
            },
      ],
    };
  }
  if (searchEmailTerm) {
    return {
      AND: [
        {
          email: {
            contains: searchEmailTerm ?? '',
            mode: 'insensitive',
          },
        },
        banStatus === 'all'
          ? {}
          : {
              banInfo: {
                isBanned: banStatusFilterValue,
              },
            },
      ],
    };
  }
  if (banStatus === 'banned' || banStatus === 'notBanned')
    return {
      banInfo: {
        isBanned: banStatusFilterValue,
      },
    };

  return {};
};

// const filter: UserFilter = {
//   AND: [
//     {
//       AND: [
//         {
//           login: {
//             contains: searchLoginTerm ?? '',
//             mode: 'insensitive',
//           },
//         },
//         {
//           email: {
//             contains: searchEmailTerm ?? '',
//             mode: 'insensitive',
//           },
//         },
//       ],
//     },
//     {
//       banInfo: {
//         isBanned: banStatusFilterValue,
//         mode: 'insensitive',
//       },
//     },
//   ],
// };
