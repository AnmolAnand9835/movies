const normalizeItem = (item, { mediaType, source } = {}) => ({
  ...item,
  media_type: item?.media_type || mediaType || null,
  source: item?.source || source || null,
});

export const normalizePage = (payload, { mediaType, source } = {}) => {
  const results = Array.isArray(payload?.data?.results) ? payload.data.results : [];

  return {
    items: results.filter(Boolean).map((item) => normalizeItem(item, { mediaType, source })),
    page: Number(payload?.pagination?.page ?? payload?.data?.page ?? 1),
    totalPages: Number(
      payload?.pagination?.total_pages ?? payload?.data?.total_pages ?? 1
    ),
    totalResults: Number(
      payload?.pagination?.total_results ?? payload?.data?.total_results ?? results.length
    ),
  };
};

export const normalizeDetail = (payload) => payload?.data ?? null;
