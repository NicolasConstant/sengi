import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval, concat, BehaviorSubject } from 'rxjs';

import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class ServiceWorkerService {
    private isListening = false;

    constructor(
        appRef: ApplicationRef,
        private updates: SwUpdate,
        private notificationService: NotificationService) {

        //https://angular.io/guide/service-worker-communications

        updates.available.subscribe(event => {
            console.log('current version is', event.current);
            console.log('available version is', event.available);

            this.notificationService.notifyRestartNotification('A new version is available!');
        });

        // Allow the app to stabilize first, before starting polling for updates with `interval()`.
        // const updateCheckTimer$ = interval(10 * 1000);
        // const appIsStable$ = appRef.isStable; //.pipe(first(isStable => isStable === true));
        // const everySixHoursOnceAppIsStable$ = concat(appIsStable$, updateCheckTimer$);
        // everySixHoursOnceAppIsStable$.subscribe(() => { 
        //     updates.checkForUpdate();
        // });

        const updateCheckTimer$ = interval(6 * 60 * 60 * 1000);

        appRef.isStable.subscribe(() => {
            if (this.isListening) return;
            this.isListening = true;

            updateCheckTimer$.subscribe(() => {
                updates.checkForUpdate();
            });
        });
    }

    loadNewAppVersion() {
        document.location.reload();
    }

    checkForUpdates(): Promise<void> {
        return this.updates.checkForUpdate();
    }
}