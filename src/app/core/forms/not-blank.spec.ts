import { FormControl } from '@angular/forms';
import forms from '../../../testing/fixtures/forms.json';
import { notBlank } from './not-blank';

describe('notBlank', () => {
  it.each(forms.blankValues)('rejects %j', (value) => {
    expect(notBlank(new FormControl(value))).toEqual({ notBlank: true });
  });

  it.each(forms.filledValues)('accepts %j without changing it', (value) => {
    const control = new FormControl(value);

    expect(notBlank(control)).toBeNull();
    expect(control.value).toBe(value);
  });
});
