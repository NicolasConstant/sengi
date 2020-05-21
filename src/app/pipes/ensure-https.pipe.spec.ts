import { EnsureHttpsPipe } from './ensure-https.pipe';

describe('EnsureHttpsPipe', () => {
    it('create an instance', () => {
        const pipe = new EnsureHttpsPipe();
        expect(pipe).toBeTruthy();
    });

    it('support null value', () => {
        const val = null;
        const pipe = new EnsureHttpsPipe();
        const result = pipe.transform(val);

        expect(result).toBe(null);
    });

    it('support not transform https://', () => {
        const val = 'https://my-link.com';
        const pipe = new EnsureHttpsPipe();
        const result = pipe.transform(val);

        expect(result).toBe(val);
    });

    it('support transform http:// to https://', () => {
        const val = 'http://my-link.com';
        const pipe = new EnsureHttpsPipe();
        const result = pipe.transform(val);

        expect(result).toBe('https://my-link.com');
    });
});
