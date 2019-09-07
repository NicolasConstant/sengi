import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { AccountInfo } from '../../../../states/accounts.state';
import { ScheduledStatus } from '../../../../services/models/mastodon.interfaces';
import { ToolsService } from '../../../../services/tools.service';
import { MastodonService } from '../../../../services/mastodon.service';
import { NotificationService } from '../../../../services/notification.service';
import { ScheduledStatusService } from '../../../../services/scheduled-status.service';
import { StatusSchedulerComponent } from '../../../../components/create-status/status-scheduler/status-scheduler.component';

@Component({
    selector: 'app-scheduled-status',
    templateUrl: './scheduled-status.component.html',
    styleUrls: ['./scheduled-status.component.scss']
})
export class ScheduledStatusComponent implements OnInit {
    deleting: boolean = false;
    rescheduling: boolean = false;

    @ViewChild(StatusSchedulerComponent) statusScheduler: StatusSchedulerComponent;

    avatar: string;
    @Input() account: AccountInfo;
    @Input() status: ScheduledStatus;

    constructor(
        private readonly scheduledStatusService: ScheduledStatusService,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
        this.toolsService.getAvatar(this.account)
            .then((avatar: string) => {
                this.avatar = avatar;
            });
    }

    delete(): boolean {
        this.deleting = !this.deleting;
        return false;
    }

    cancelDeletion(): boolean {
        this.deleting = false;
        return false;
    }

    confirmDeletion(): boolean {
        this.mastodonService.deleteScheduledStatus(this.account, this.status.id)
            .then(() => {
                this.scheduledStatusService.removeStatus(this.account, this.status.id);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
        return false;
    }

    reschedule(): boolean {
        this.rescheduling = !this.rescheduling;
        return false;
    }

    cancelReschedule(): boolean {
        this.rescheduling = false;
        return false;
    }

    confirmReschedule(): boolean {
        let scheduledTime = this.statusScheduler.getScheduledDate();
        this.mastodonService.changeScheduledStatus(this.account, this.status.id, scheduledTime)
            .then(() => {
                this.status.scheduled_at = scheduledTime;
                this.rescheduling = false;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });
        return false;
    }
}
