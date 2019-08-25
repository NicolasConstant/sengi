import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';

import { MastodonService } from './mastodon.service';
import { AccountInfo } from '../states/accounts.state';
import { ScheduledStatus } from './models/mastodon.interfaces';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class ScheduledStatusService {
    scheduledStatuses = new BehaviorSubject<ScheduledStatusNotification[]>([]);

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService,
        private readonly store: Store) {

        this.fetchScheduledStatus();
    }

    private fetchScheduledStatus() {
        let accounts = this.store.snapshot().registeredaccounts.accounts;
        let promises: Promise<any>[] = [];

        accounts.forEach((account: AccountInfo) => {
            let promise = this.mastodonService.getScheduledStatuses(account)
                .then((statuses: ScheduledStatus[]) => {
                    if (statuses) {
                        this.processStatuses(account, statuses);
                    }
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err);
                });
            promises.push(promise);
        });

        Promise.all(promises)
            .then(() => {
                setTimeout(() => {
                    this.fetchScheduledStatus();
                }, 70 * 1000);
            });
    }

    private processStatuses(account: AccountInfo, statuses: ScheduledStatus[]) {
        let previousStatuses: ScheduledStatus[] = [];
        const notification = this.scheduledStatuses.value.find(x => x.account.id === account.id);
        if (notification) {
            previousStatuses = notification.statuses;
        }

        let uniques: string[] = [];
        if (statuses && previousStatuses) {
            uniques = [...new Set([...statuses, ...previousStatuses].map(x => x.id))];
        }

        if (uniques.length !== previousStatuses.length) {
            const currentStatuses = new ScheduledStatusNotification(account, statuses);

            const otherNotifications = this.scheduledStatuses.value.filter(x => x.account.id !== account.id);
            const currentNotifications = [...otherNotifications, currentStatuses];

            this.scheduledStatuses.next(currentNotifications);
        }
    }
}

export class ScheduledStatusNotification {
    constructor(
        public readonly account: AccountInfo,
        public statuses: ScheduledStatus[]) {
    }
}
