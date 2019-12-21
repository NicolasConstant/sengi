//https://github.com/AndrewPoyntz/time-ago-pipe/issues/6#issuecomment-313726956

import { Pipe, PipeTransform, NgZone } from "@angular/core";
import { Observable, Observer } from 'rxjs';

interface processOutput {
    text: string; // Convert timestamp to string
    timeToUpdate: number; // Time until update in milliseconds
}

@Pipe({
    name: 'timeAgo',
    pure: true
})
export class TimeAgoPipe implements PipeTransform {

    constructor(private ngZone: NgZone) { }

    private process = (timestamp: number): processOutput => {
        let text: string;
        let timeToUpdate: number;

        const now = new Date();

        // Time ago in milliseconds
        const timeAgo: number = now.getTime() - timestamp;

        const seconds = timeAgo / 1000;
        const minutes = seconds / 60;
        const hours = minutes / 60;
        const days = hours / 24;
        // const months = days / 30.416;
        // const years = days / 365;

        if (seconds <= 59) {
            text = Math.round(seconds) + 's';
        } else if (minutes <= 59) {
            text = Math.round(minutes) + 'm';
        } else if (hours <= 23) {
            text = Math.round(hours) + 'h';
        } else {
            text = Math.round(days) + 'd';
        }

        if (minutes < 1) {
            // update every 2 secs
            timeToUpdate = 2 * 1000;
        } else if (hours < 1) {
            // update every 30 secs
            timeToUpdate = 30 * 1000;
        } else if (days < 1) {
            // update every 5 mins
            timeToUpdate = 300 * 1000;
        } else {
            // update every hour
            timeToUpdate = 3600 * 1000;
        }

        return {
            text,
            timeToUpdate
        };
    }

    public transform = (value: string | Date): Observable<string> => {
        let d: Date;
        if (value instanceof Date) {
            d = value;
        }
        else {
            d = new Date(value);
        }
        // time value in milliseconds
        const timestamp = d.getTime();

        let timeoutID: any;

        return Observable.create((observer: Observer<string>) => {
            let latestText = '';

            // Repeatedly set new timeouts for new update checks.
            const registerUpdate = () => {
                const processOutput = this.process(timestamp);
                if (processOutput.text !== latestText) {
                    latestText = processOutput.text;
                    this.ngZone.run(() => {
                        observer.next(latestText);
                    });
                }
                timeoutID = setTimeout(registerUpdate, processOutput.timeToUpdate);
            };

            this.ngZone.runOutsideAngular(registerUpdate);

            // Return teardown function
            const teardownFunction = () => {
                if (timeoutID) {
                    clearTimeout(timeoutID);
                }
            };
            return teardownFunction;
        });
    }
}