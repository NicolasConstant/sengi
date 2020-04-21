import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

import { AccountWrapper } from '../../../../models/account.models';
import { UserNotificationService, UserNotification } from '../../../../services/user-notification.service';
import { StatusWrapper } from '../../../../models/common.model';
import { Status, Notification } from '../../../../services/models/mastodon.interfaces';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { NotificationService } from '../../../../services/notification.service';
import { OpenThreadEvent, ToolsService } from '../../../../services/tools.service';
import { TimeLineModeEnum } from '../../../../states/settings.state';


@Component({
    selector: 'app-mentions',
    templateUrl: '../../../stream/stream-statuses/stream-statuses.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './mentions.component.scss']
})
export class MentionsComponent implements OnInit, OnDestroy {
    statuses: StatusWrapper[] = [];
    displayError: string;
    isLoading = false;
    isThread = false;
    hasContentWarnings = false;

    bufferStream: Status[] = []; //html compatibility only
    streamPositionnedAtTop: boolean = true; //html compatibility only
    timelineLoadingMode: TimeLineModeEnum = TimeLineModeEnum.OnTop; //html compatibility only

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input('account')
    set account(acc: AccountWrapper) {
        this._account = acc;
        this.loadMentions();
    }
    get account(): AccountWrapper {
        return this._account;
    }

    @ViewChild('statusstream') public statustream: ElementRef;

    private maxReached = false;
    private _account: AccountWrapper;
    private userNotificationServiceSub: Subscription;
    private lastId: string;

    constructor(
        private readonly toolsService: ToolsService,
        private readonly notificationService: NotificationService,
        private readonly userNotificationService: UserNotificationService,
        private readonly mastodonService: MastodonWrapperService) {

    }

    ngOnInit() {
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
        this.userNotificationService.markMentionsAsRead(this.account.info);

        this.userNotificationServiceSub = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {
            this.processNewMentions(userNotifications);
            if(this.statuses.length < 20) this.scrolledToBottom();
        });
    }

    private processNewMentions(userNotifications: UserNotification[]) {        
        const userNotification = userNotifications.find(x => x.account.id === this.account.info.id);
        if (userNotification && userNotification.mentions) {
            let orderedMentions = [...userNotification.mentions.map(x => x.status)].reverse();
            for (let m of orderedMentions) {
                if (!this.statuses.find(x => x.status.id === m.id)) {
                    let cwPolicy = this.toolsService.checkContentWarning(m);
                    const statusWrapper = new StatusWrapper(cwPolicy.status, this.account.info, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.unshift(statusWrapper);
                }
            }
        }
        this.lastId = userNotification.lastMentionsId;
        this.userNotificationService.markMentionsAsRead(this.account.info);
    }

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;

        if (atBottom) {
            this.scrolledToBottom();
        }
    }

    private scrolledToBottom() {
        if (this.isLoading || this.maxReached || this.statuses.length === 0) return;

        this.isLoading = true;

        this.mastodonService.getNotifications(this.account.info, ['follow', 'favourite', 'reblog', 'poll'], this.lastId)
            .then((result: Notification[]) => {

                const statuses = result.map(x => x.status);
                if (statuses.length === 0) {
                    this.maxReached = true;
                    return;
                }

                for (const s of statuses) {
                    let cwPolicy = this.toolsService.checkContentWarning(s);
                    const wrapper = new StatusWrapper(cwPolicy.status, this.account.info, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.push(wrapper);
                }

                this.lastId = result[result.length - 1].id;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            })
            .then(() => {
                this.isLoading = false;
            });
    }

    browseAccount(accountName: string): void {
        this.browseAccountEvent.next(accountName);
    }

    browseHashtag(hashtag: string): void {
        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.browseThreadEvent.next(openThreadEvent);
    }
}
