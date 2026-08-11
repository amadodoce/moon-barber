export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

export function normalizeListQuery(
  params: ListQueryParams = {},
  defaultPageSize = 20
): Required<Pick<ListQueryParams, "page" | "pageSize">> &
  Pick<ListQueryParams, "status" | "search"> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? defaultPageSize));
  const status = params.status?.trim() || "all";
  const search = params.search?.trim() || "";
  return { page, pageSize, status, search };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
