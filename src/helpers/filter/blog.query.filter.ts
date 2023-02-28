export const blogQueryFilter = (
  searchNameTerm: string | null,
  userId: string | undefined,
) => {
  if (searchNameTerm && userId) {
    return {
      name: {
        $regex: searchNameTerm ?? '',
        $options: 'i',
      },
      'blogOwnerInfo.userId': {
        $regex: userId ?? '',
      },
    };
  }
  if (searchNameTerm) {
    return {
      name: {
        $regex: searchNameTerm ?? '',
        $options: 'i',
      },
    };
  }
  if (userId) {
    return {
      'blogOwnerInfo.userId': {
        $regex: userId ?? '',
      },
    };
  }
  return {};
};
