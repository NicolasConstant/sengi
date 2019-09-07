import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ScheduledStatusService, ScheduledStatusNotification } from '../../../services/scheduled-status.service';
import { ScheduledStatus } from '../../../services/models/mastodon.interfaces';
import { AccountInfo } from '../../../states/accounts.state';

@Component({
    selector: 'app-scheduled-statuses',
    templateUrl: './scheduled-statuses.component.html',
    styleUrls: ['./scheduled-statuses.component.scss']
})
export class ScheduledStatusesComponent implements OnInit, OnDestroy {
    private statusSub: Subscription;
    // scheduledStatuses: ScheduledStatusNotification[] = [];
    scheduledStatuses: ScheduledStatusWrapper[] = [];

    constructor(
        private readonly scheduledStatusService: ScheduledStatusService) {
    }

    ngOnInit() {
        this.statusSub = this.scheduledStatusService.scheduledStatuses.subscribe((value: ScheduledStatusNotification[]) => {
            this.scheduledStatuses.length = 0;

            value.forEach(notification => {
                notification.statuses.forEach(status => {
                    let wrapper = new ScheduledStatusWrapper(notification.account, status);
                    this.scheduledStatuses.push(wrapper);
                });
            });

            this.sortStatuses();
        });
    }

    ngOnDestroy(): void {
        if (this.statusSub) this.statusSub.unsubscribe();
    }

    private sortStatuses() {
        this.scheduledStatuses.sort((x, y) => new Date(x.status.scheduled_at).getTime() - new Date(y.status.scheduled_at).getTime());
    }

    statusRescheduled() {
        this.sortStatuses();
    }
}

class ScheduledStatusWrapper {
    constructor(
        public readonly account: AccountInfo,
        public status: ScheduledStatus) {
    }
}
