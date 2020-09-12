import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ensureHttps'
})
export class EnsureHttpsPipe implements PipeTransform {
    transform(value: string, args?: any): any {
        if(!value) return value;
        return value.replace('http://', 'https://');
    }
}
