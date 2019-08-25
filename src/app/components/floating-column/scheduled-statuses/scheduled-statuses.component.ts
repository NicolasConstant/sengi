import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ScheduledStatusService, ScheduledStatusNotification } from '../../../services/scheduled-status.service';

@Component({
    selector: 'app-scheduled-statuses',
    templateUrl: './scheduled-statuses.component.html',
    styleUrls: ['./scheduled-statuses.component.scss']
})
export class ScheduledStatusesComponent implements OnInit, OnDestroy {
    private statusSub: Subscription;
    scheduledStatuses: ScheduledStatusNotification[] = [];

    constructor(
        private readonly scheduledStatusService: ScheduledStatusService) {            
    }

    ngOnInit() {
        this.statusSub = this.scheduledStatusService.scheduledStatuses.subscribe((value: ScheduledStatusNotification[]) => {
            console.warn(value);
            this.scheduledStatuses = value;
        });
    }

    ngOnDestroy(): void {
        if (this.statusSub) this.statusSub.unsubscribe();
    }
}
