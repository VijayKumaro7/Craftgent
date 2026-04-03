import { AxiosError } from 'axios';

export interface ApiError {
  detail?: string | { msg: string }[];
  message?: string;
}

export type ApiErrorType = AxiosError<ApiError>;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  database: string;
}
