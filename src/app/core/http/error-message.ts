import { HttpErrorResponse } from '@angular/common/http';
import { HttpStatus } from '../constants/http-status';
import { UiText } from '../constants/ui-text';
import { ProblemDetail } from './problem-detail';

export function hasStatus(error: unknown, status: HttpStatus): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}

export function retryAfterSeconds(error: unknown): number | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }
  const value = error.headers.get('Retry-After');
  return value && /^[1-9]\d*$/.test(value) ? Number(value) : null;
}

export function errorMessage(error: unknown): UiText {
  return hasStatus(error, HttpStatus.FORBIDDEN) ? UiText.FORBIDDEN : UiText.GENERIC_ERROR;
}

export function problemDetail(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }
  const problem = error.error as ProblemDetail | null;
  return typeof problem?.detail === 'string' ? problem.detail : null;
}
