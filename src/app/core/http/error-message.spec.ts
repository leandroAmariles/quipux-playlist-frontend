import { HttpErrorResponse } from '@angular/common/http';
import problems from '../../../testing/fixtures/problems.json';
import { HttpStatus } from '../constants/http-status';
import { UiText } from '../constants/ui-text';
import { errorMessage, hasStatus, problemDetail } from './error-message';

describe('errorMessage', () => {
  it('explains a missing permission', () => {
    const error = new HttpErrorResponse({ status: HttpStatus.FORBIDDEN });

    expect(errorMessage(error)).toBe(UiText.FORBIDDEN);
  });

  it.each(problems.generalStatuses)('uses the general message for status %i', (status) => {
    expect(errorMessage(new HttpErrorResponse({ status }))).toBe(UiText.GENERIC_ERROR);
  });

  it('uses the general message for an error that is not an HTTP response', () => {
    expect(errorMessage(new Error())).toBe(UiText.GENERIC_ERROR);
  });

  it('recognises the status of an HTTP error only', () => {
    const error = new HttpErrorResponse({ status: HttpStatus.CONFLICT });

    expect(hasStatus(error, HttpStatus.CONFLICT)).toBe(true);
    expect(hasStatus(error, HttpStatus.NOT_FOUND)).toBe(false);
    expect(hasStatus(new Error(), HttpStatus.CONFLICT)).toBe(false);
  });

  it('reads the detail of a problem response, when there is one', () => {
    const rejected = new HttpErrorResponse({ status: 400, error: problems.unknownGenre });
    const plainText = new HttpErrorResponse({ status: 502, error: 'Bad Gateway' });

    expect(problemDetail(rejected)).toBe(problems.unknownGenre.detail);
    expect(problemDetail(plainText)).toBeNull();
    expect(problemDetail(new Error())).toBeNull();
  });
});
