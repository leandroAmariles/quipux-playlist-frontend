import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { click, find, findAll, textOf } from '../../../../../testing/dom';
import problems from '../../../../../testing/fixtures/problems.json';
import fixtures from '../../../../../testing/fixtures/recommendations.json';
import { recommendationsPath } from '../../../../core/constants/api-path';
import { HttpStatus } from '../../../../core/constants/http-status';
import { tooManyRequestsText, UiText } from '../../../../core/constants/ui-text';
import { RecommendationsPanel } from './recommendations-panel';

describe('RecommendationsPanel', () => {
  const name = fixtures.ai.lista;
  let fixture: ComponentFixture<RecommendationsPanel>;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RecommendationsPanel);
    fixture.componentRef.setInput('playlistName', name);
    TestBed.tick();
  });

  afterEach(() => http.verify());

  function ask(): void {
    click(fixture, 'button.recommend');
  }

  function answer(body: object): void {
    http.expectOne(recommendationsPath(name)).flush(body);
    TestBed.tick();
  }

  function button(): HTMLButtonElement {
    return find<HTMLButtonElement>(fixture, 'button.recommend')!;
  }

  function rows(): string[][] {
    return findAll(fixture, 'tbody tr').map((row) =>
      Array.from(row.querySelectorAll('td'), (cell) => cell.textContent!.trim()),
    );
  }

  describe('asking for suggestions', () => {
    it('does not ask until the button is pressed', () => {
      expect(button().textContent!.trim()).toBe(UiText.GET_RECOMMENDATIONS);
      expect(button().disabled).toBe(false);
      expect(textOf(fixture)).not.toContain(UiText.RECOMMENDATIONS_LOADING);
      http.expectNone(recommendationsPath(name));
    });

    it('shows its own loading state and sends a single request', () => {
      ask();

      expect(find(fixture, '[role="status"]')!.textContent).toContain(
        UiText.RECOMMENDATIONS_LOADING,
      );
      expect(button().disabled).toBe(true);
      ask();
      answer(fixtures.ai);
      expect(textOf(fixture)).not.toContain(UiText.RECOMMENDATIONS_LOADING);
      expect(button().disabled).toBe(false);
    });

    it('shows each suggestion in order, marking the missing values', () => {
      ask();

      answer(fixtures.ai);

      expect(rows()).toEqual([
        ['Sugerida uno', 'Artista X', 'rock', 'Mismo género y época'],
        ['Sugerida dos', 'Artista Y', UiText.MISSING_VALUE, UiText.MISSING_VALUE],
      ]);
    });

    it('says when there are no suggestions', () => {
      ask();

      answer(fixtures.empty);

      expect(textOf(fixture)).toContain(UiText.NO_RECOMMENDATIONS);
      expect(find(fixture, 'table')).toBeNull();
    });

    it('shows the text written by the model literally, never as HTML', () => {
      ask();

      answer(fixtures.markup);

      expect(rows()[0][3]).toBe(fixtures.markup.recomendaciones[0].motivo);
      expect(find(fixture, 'img')).toBeNull();
    });

    it('drops the previous result when asked again', () => {
      ask();
      answer(fixtures.ai);

      ask();

      expect(find(fixture, 'table')).toBeNull();
      answer(fixtures.fallback);
      expect(rows().map(([title]) => title)).toEqual(['De respaldo']);
    });

    it('cancels the pending request when it is destroyed', () => {
      ask();
      const pending = http.expectOne(recommendationsPath(name));

      fixture.destroy();

      expect(pending.cancelled).toBe(true);
    });
  });

  describe('origin of the suggestions', () => {
    const originTexts = [UiText.ORIGIN_AI, UiText.ORIGIN_FALLBACK, UiText.ORIGIN_SIMILARITY];

    function shownOrigins(): UiText[] {
      return originTexts.filter((text) => textOf(fixture).includes(text));
    }

    it.each([
      ['ai', UiText.ORIGIN_AI],
      ['fallback', UiText.ORIGIN_FALLBACK],
      ['similarity', UiText.ORIGIN_SIMILARITY],
      ['empty', UiText.ORIGIN_FALLBACK],
    ] as const)('is told for the %s answer, and not as an error', (answerName, expected) => {
      ask();

      answer(fixtures[answerName]);

      expect(shownOrigins()).toEqual([expected]);
      expect(find(fixture, '[role="alert"]')).toBeNull();
    });

    it('warns that AI suggestions without a catalogue id are unverified', () => {
      ask();

      answer(fixtures.ai);

      expect(textOf(fixture)).toContain(UiText.UNVERIFIED_RECOMMENDATIONS);
    });

    it.each(['verified', 'fallback', 'similarity', 'empty'] as const)(
      'does not warn about the %s answer',
      (answerName) => {
        ask();

        answer(fixtures[answerName]);

        expect(textOf(fixture)).not.toContain(UiText.UNVERIFIED_RECOMMENDATIONS);
      },
    );
  });

  describe('failures', () => {
    function fail(status: number, headers: Record<string, string> = {}): void {
      const request = http.expectOne(recommendationsPath(name));
      if (status) {
        request.flush(null, { status, statusText: 'error', headers });
      } else {
        request.error(new ProgressEvent('error'));
      }
      TestBed.tick();
    }

    function alertText(): string | undefined {
      return find(fixture, '[role="alert"]')?.textContent?.trim();
    }

    it('says how long to wait after too many requests', () => {
      ask();

      fail(HttpStatus.TOO_MANY_REQUESTS, { 'Retry-After': '42' });

      expect(alertText()).toBe(tooManyRequestsText(42));
    });

    it('asks to try later when too many requests come without a waiting time', () => {
      ask();

      fail(HttpStatus.TOO_MANY_REQUESTS);

      expect(alertText()).toBe(UiText.TOO_MANY_REQUESTS);
    });

    it.each<[number, UiText]>([
      [HttpStatus.NOT_FOUND, UiText.PLAYLIST_NOT_FOUND],
      [HttpStatus.FORBIDDEN, UiText.FORBIDDEN],
      ...problems.generalStatuses.map((status): [number, UiText] => [status, UiText.GENERIC_ERROR]),
    ])('explains the status %i', (status, expected) => {
      ask();

      fail(status);

      expect(alertText()).toBe(expected);
      expect(textOf(fixture)).not.toContain(UiText.RECOMMENDATIONS_LOADING);
    });

    it('waits for the user to try again, then forgets the failure', () => {
      ask();
      fail(0);
      expect(button().disabled).toBe(false);
      http.expectNone(recommendationsPath(name));

      ask();
      expect(alertText()).toBeUndefined();
      answer(fixtures.ai);

      expect(alertText()).toBeUndefined();
      expect(rows()).toHaveLength(2);
    });
  });
});
