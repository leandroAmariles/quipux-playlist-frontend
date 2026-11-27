import { ComponentFixture, TestBed } from '@angular/core/testing';

export function find<T extends Element = HTMLElement>(
  fixture: ComponentFixture<unknown>,
  selector: string,
): T | null {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
}

export function findAll<T extends Element = HTMLElement>(
  fixture: ComponentFixture<unknown>,
  selector: string,
): T[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));
}

export function textOf(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

export function type(fixture: ComponentFixture<unknown>, selector: string, value: string): void {
  const field = find<HTMLInputElement>(fixture, selector)!;
  field.value = value;
  field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
  TestBed.tick();
}

export function click(fixture: ComponentFixture<unknown>, selector: string): void {
  find<HTMLElement>(fixture, selector)!.click();
  TestBed.tick();
}

export function submit(fixture: ComponentFixture<unknown>): void {
  find(fixture, 'form')!.dispatchEvent(new Event('submit'));
  TestBed.tick();
}
