import { Component, Input } from '@angular/core';
import { faUserPlus, faUserClock, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

import { NotificationWrapper } from '../notifications.component';
import { ToolsService } from '../../../../../services/tools.service';
import { Account } from '../../../../../services/models/mastodon.interfaces';
import { BrowseBase } from '../../../../../components/common/browse-base';
import { MastodonWrapperService } from '../../../../../services/mastodon-wrapper.service';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent extends BrowseBase {
    faUserPlus = faUserPlus;
    faUserClock = faUserClock;
    faCheck = faCheck;
    faTimes = faTimes;

    @Input() notification: NotificationWrapper;

    constructor(
        private readonly notificationsService: NotificationService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly toolsService: ToolsService) {
        super();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    openAccount(account: Account): boolean {
        let accountName = this.toolsService.getAccountFullHandle(account);
        this.browseAccountEvent.next(accountName);
        return false;
    }

    openUrl(url: string): boolean {
        window.open(url, '_blank');
        return false;
    }

    followRequestWorking: boolean;
    followRequestProcessed: boolean;
    acceptFollowRequest(): boolean {
        if(this.followRequestWorking) return false;
        this.followRequestWorking = true;

        this.mastodonService.authorizeFollowRequest(this.notification.provider, this.notification.notification.account.id)
            .then(res => {
                this.followRequestProcessed = true;
            })
            .catch(err => {
                this.notificationsService.notifyHttpError(err, this.notification.provider);
            })
            .then(res => {
                this.followRequestWorking = false;
            });

        return false;
    }

    refuseFollowRequest(): boolean {
        if(this.followRequestWorking) return false;
        this.followRequestWorking = true;

        this.mastodonService.rejectFollowRequest(this.notification.provider, this.notification.notification.account.id)
            .then(res => {
                this.followRequestProcessed = true;
            })
            .catch(err => {
                this.notificationsService.notifyHttpError(err, this.notification.provider);
            })
            .then(res => {
                this.followRequestWorking = false;
            });

        return false;
    }
}
