export const getNextPageParam = (lastPage) => {
  if (!lastPage) return undefined;
  const page = Number(lastPage.page) || 1;
  const totalPages = Number(lastPage.totalPages) || 1;
  return page < totalPages ? page + 1 : undefined;
};

export const flattenPages = (data) =>
  data?.pages?.flatMap((page) => page?.items ?? []) ?? [];

export const getTotalResults = (data) => data?.pages?.[0]?.totalResults ?? 0;
