import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { AccountWrapper } from '../../../../models/account.models';
import { UserNotificationService, UserNotification } from '../../../../services/user-notification.service';
import { StatusWrapper } from '../../../../models/common.model';
import { Status, Notification } from '../../../../services/models/mastodon.interfaces';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { NotificationService } from '../../../../services/notification.service';
import { ToolsService } from '../../../../services/tools.service';
import { TimelineBase } from '../../../../components/common/timeline-base';


@Component({
    selector: 'app-mentions',
    templateUrl: '../../../stream/stream-statuses/stream-statuses.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './mentions.component.scss']
})
export class MentionsComponent extends TimelineBase {
    private lastId: string;
    private _account: AccountWrapper;

    @Input('account')
    set accountWrapper(acc: AccountWrapper) {
        this._account = acc;
        this.account = acc.info;
        this.loadMentions();
    }
    get accountWrapper(): AccountWrapper {
        return this._account;
    }

    private userNotificationServiceSub: Subscription;    

    constructor(
        protected readonly toolsService: ToolsService,
        protected readonly notificationService: NotificationService,
        protected readonly userNotificationService: UserNotificationService,
        protected readonly mastodonService: MastodonWrapperService) {

        super(toolsService, notificationService, mastodonService);
    }

    ngOnInit() {
        this.isLoading = false;
    }

    ngOnDestroy(): void {
        if (this.userNotificationServiceSub) {
            this.userNotificationServiceSub.unsubscribe();
        }
    }

    private loadMentions() {
        if (this.userNotificationServiceSub) {
            this.userNotificationServiceSub.unsubscribe();
        }

        this.statuses.length = 0;
        this.userNotificationService.markMentionsAsRead(this.account);

        this.userNotificationServiceSub = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {
            this.processNewMentions(userNotifications);
            if (this.statuses.length < 20) this.scrolledToBottom();
        });
    }

    private processNewMentions(userNotifications: UserNotification[]) {
        const userNotification = userNotifications.find(x => x.account.id === this.account.id);
        if (userNotification && userNotification.mentions) {
            let orderedMentions = [...userNotification.mentions.map(x => x.status)].reverse();
            for (let m of orderedMentions) {
                if (m && !this.statuses.find(x => x.status.id === m.id)) {
                    let cwPolicy = this.toolsService.checkContentWarning(m);
                    const statusWrapper = new StatusWrapper(cwPolicy.status, this.account, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.unshift(statusWrapper);
                }
            }
        }
        this.lastId = userNotification.lastMentionsId;
        this.userNotificationService.markMentionsAsRead(this.account);
    }

    protected getNextStatuses(): Promise<Status[]> {
        return this.mastodonService.getNotifications(this.account, ['follow', 'favourite', 'reblog', 'poll', 'move'], this.lastId)
             .then((result: Notification[]) => {
                const statuses = result.map(x => x.status);
                                 
                 this.lastId = result[result.length - 1].id;
 
                 return statuses;
             });
     }
   
    protected scrolledToTop() {}

    protected statusProcessOnGoToTop(){}
}
