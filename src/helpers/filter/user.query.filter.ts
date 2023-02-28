import { banStatusEnumKeys } from '../pagination/dto/users.pagination.query.dto';

export const userQueryFilter = (
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
  banStatus: banStatusEnumKeys,
) => {
  const banStatusFilterValue =
    banStatus === 'all' ? {} : banStatus === 'banned' ? true : false;

  if (searchLoginTerm && searchEmailTerm) {
    return {
      $and: [
        {
          $or: [
            {
              'accountData.login': {
                $regex: searchLoginTerm ?? '',
                $options: 'i',
              },
            },
            {
              'accountData.email': {
                $regex: searchEmailTerm ?? '',
                $options: 'i',
              },
            },
          ],
        },
        banStatus === 'all'
          ? {}
          : {
              'banInfo.isBanned': banStatusFilterValue,
            },
      ],
    };
  }
  if (searchLoginTerm) {
    return {
      $and: [
        {
          'accountData.login': {
            $regex: searchLoginTerm ?? '',
            $options: 'i',
          },
        },
        banStatus === 'all'
          ? {}
          : {
              'banInfo.isBanned': banStatusFilterValue,
            },
      ],
    };
  }
  if (searchEmailTerm) {
    return {
      $and: [
        {
          'accountData.email': {
            $regex: searchEmailTerm ?? '',
            $options: 'i',
          },
        },
        banStatus === 'all'
          ? {}
          : {
              'banInfo.isBanned': banStatusFilterValue,
            },
      ],
    };
  }
  if (banStatus === 'banned' || banStatus === 'notBanned')
    return { 'banInfo.isBanned': banStatusFilterValue };

  return {};
};
