import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { first } from 'rxjs/operators';
import { interval, concat, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ServiceWorkerService {

    newAppVersionIsAvailable = new BehaviorSubject<boolean>(false);

    constructor(appRef: ApplicationRef, updates: SwUpdate) {

        //https://angular.io/guide/service-worker-communications

        updates.available.subscribe(event => {
            console.log('current version is', event.current);
            console.log('available version is', event.available);

            this.newAppVersionIsAvailable.next(true);
        });

        // Allow the app to stabilize first, before starting polling for updates with `interval()`.
        //const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
        // const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
        // everySixHoursOnceAppIsStable$.subscribe(() => { 
        //     console.warn('wat?');
        //     updates.checkForUpdate();
        // });

        const updateCheckTimer$ = interval(2 * 60 * 60 * 1000);
        updateCheckTimer$.subscribe(() => {
            updates.checkForUpdate();
        });
    }

    loadNewAppVersion() {
        document.location.reload();
    }
}