import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
    name: 'mastodontime',
    pure: false
})
export class MastodonTimePipe implements PipeTransform {

    constructor(@Inject(LOCALE_ID) private locale: string) { }

    // private cachedDict: { [id:string] : string } = {};
    // private cached: string;
    // private resultCached: string;

    transform(value: string): string {
        // if (value == this.cached && this.resultCached) {
        //     return this.resultCached;
        // }

        // if(this.cachedDict[value]) {
        //     return this.cachedDict[value];
        // }

        const date = (new Date(value)).getTime();
        const now = Date.now();
        const timeDelta = (now - date) / (1000);

        if (timeDelta < 60) {
            return `${timeDelta | 0}s`;
        } else if (timeDelta < 60 * 60) {
            return `${timeDelta / 60 | 0}m`;
        } else if (timeDelta < 60 * 60 * 24) {
            return `${timeDelta / (60 * 60) | 0}h`;
        } else if (timeDelta < 60 * 60 * 24 * 31) {
            return `${timeDelta / (60 * 60 * 24) | 0}d`;
        }
        
        return formatDate(date, 'MM/dd', this.locale);

        // this.cachedDict[value] = formatDate(date, 'MM/dd', this.locale);

        // // this.cached = value;
        // // this.resultCached = formatDate(date, 'MM/dd', this.locale);

        // return this.cachedDict[value];
    }
}
