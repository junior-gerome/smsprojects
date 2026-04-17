import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  validationErrors: Record<string, string>;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue.'
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Le backend Spring Boot est inaccessible.';
    }

    const apiError = error.error as Partial<ApiErrorResponse> | null;
    if (apiError?.message) {
      return apiError.message;
    }
  }

  return fallback;
}
