import { TimeLeftPipe } from './time-left.pipe';

xdescribe('TimeLeftPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeLeftPipe(null);
    expect(pipe).toBeTruthy();
  });
});
