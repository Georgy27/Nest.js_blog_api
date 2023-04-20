export const postsQuerySorting = function (
  sortBy: string,
  sortDirection: 'asc' | 'desc',
) {
  if (sortBy === 'blogName') {
    return {
      blog: {
        name: sortDirection,
      },
    };
  } else if (!isPostSortValue(sortBy))
    return {
      createdAt: sortDirection,
    };
  return {
    [sortBy]: sortDirection,
  };
};

const ALL_POST_SORT_VALUES = [
  'title',
  'shortDescription',
  'content',
  'createdAt',
] as const;
type PostsTuple = typeof ALL_POST_SORT_VALUES;
type PostUnion = PostsTuple[number];

function isPostSortValue(value: string): value is PostUnion {
  return ALL_POST_SORT_VALUES.includes(value as PostUnion);
}
