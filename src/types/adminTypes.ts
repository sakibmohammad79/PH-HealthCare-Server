export type TCalculatePagination = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export type TPaginationOptionResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};
