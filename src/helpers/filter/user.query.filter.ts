export const userQueryFilter = (
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
) => {
  if (searchLoginTerm && searchEmailTerm) {
    return {
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
    };
  }
  if (searchLoginTerm) {
    return {
      'accountData.login': {
        $regex: searchLoginTerm ?? '',
        $options: 'i',
      },
    };
  }
  if (searchEmailTerm) {
    return {
      'accountData.email': {
        $regex: searchEmailTerm ?? '',
        $options: 'i',
      },
    };
  }
  return {};
};
