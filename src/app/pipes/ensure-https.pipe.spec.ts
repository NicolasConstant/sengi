import { EnsureHttpsPipe } from './ensure-https.pipe';

describe('EnsureHttpsPipe', () => {
  it('create an instance', () => {
    const pipe = new EnsureHttpsPipe();
    expect(pipe).toBeTruthy();
  });
});
