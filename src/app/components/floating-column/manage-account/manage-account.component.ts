import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { faAt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { faBell, faEnvelope, faUser, faStar, faBookmark } from "@fortawesome/free-regular-svg-icons";
import { Subscription } from 'rxjs';

import { AccountWrapper } from '../../../models/account.models';
import { UserNotificationService, UserNotification } from '../../../services/user-notification.service';
import { OpenThreadEvent, ToolsService, InstanceInfo } from '../../../services/tools.service';
import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';
import { Account } from "../../../services/models/mastodon.interfaces";
import { NotificationService } from '../../../services/notification.service';
import { AccountInfo } from '../../../states/accounts.state';


@Component({
    selector: 'app-manage-account',
    templateUrl: './manage-account.component.html',
    styleUrls: ['./manage-account.component.scss']
})
export class ManageAccountComponent implements OnInit, OnDestroy {
    faAt = faAt;
    faBell = faBell;
    faEnvelope = faEnvelope;
    faUser = faUser;
    faStar = faStar;
    faUserPlus = faUserPlus;
    faBookmark = faBookmark;

    subPanel: 'account' | 'notifications' | 'mentions' | 'dm' | 'favorites' | 'bookmarks' = 'account';
    hasNotifications = false;
    hasMentions = false;
    isBookmarksAvailable = false;

    userAccount: Account;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input('account')
    set account(acc: AccountWrapper) {
        this._account = acc;
        this.checkIfBookmarksAreAvailable();
        this.checkNotifications();
        this.getUserUrl(acc.info);
    }
    get account(): AccountWrapper {
        return this._account;
    }

    private userNotificationServiceSub: Subscription;
    private _account: AccountWrapper;

    constructor(
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly notificationService: NotificationService,
        private readonly userNotificationService: UserNotificationService) { }

    ngOnInit() {        
    }

    ngOnDestroy(): void {
        this.userNotificationServiceSub.unsubscribe();
    }

    private checkIfBookmarksAreAvailable() {
        this.toolsService.getInstanceInfo(this.account.info)
            .then((instance: InstanceInfo) => {
                if (instance.major >= 3 && instance.minor >= 1) {
                    this.isBookmarksAvailable = true;
                } else {
                    this.isBookmarksAvailable = false;
                }
            })
            .catch(err => {
                this.isBookmarksAvailable = false;
            });
    }

    private getUserUrl(account: AccountInfo) {
        this.mastodonService.retrieveAccountDetails(this.account.info)
            .then((acc: Account) => {
                this.userAccount = acc;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            });
    }

    private checkNotifications() {
        if (this.userNotificationServiceSub) {
            this.userNotificationServiceSub.unsubscribe();
        }

        this.userNotificationServiceSub = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {
            const userNotification = userNotifications.find(x => x.account.id === this.account.info.id);
            if (userNotification) {
                let settings = this.toolsService.getSettings();
                let accSettings = this.toolsService.getAccountSettings(this.account.info);

                if (!settings.disableAvatarNotifications && !accSettings.disableAvatarNotifications) {
                    this.hasNotifications = userNotification.hasNewNotifications;
                    this.hasMentions = userNotification.hasNewMentions;
                }
            }
        });

        let current = this.userNotificationService.userNotifications.value;
        const userNotification = current.find(x => x.account.id === this.account.info.id);
        if (userNotification) {
            let settings = this.toolsService.getSettings();
            let accSettings = this.toolsService.getAccountSettings(this.account.info);

            if (!settings.disableAutofocus && !settings.disableAvatarNotifications && !accSettings.disableAvatarNotifications) {
                if (userNotification.hasNewNotifications) {
                    this.loadSubPanel('notifications');
                } else if (userNotification.hasNewMentions) {
                    this.loadSubPanel('mentions');
                }
            }
        }
    }

    loadSubPanel(subpanel: 'account' | 'notifications' | 'mentions' | 'dm' | 'favorites'): boolean {
        this.subPanel = subpanel;
        return false;
    }

    browseAccount(accountName: string): void {
        this.browseAccountEvent.next(accountName);
    }

    browseLocalAccount(): boolean {
        var accountName = `@${this.account.info.username}@${this.account.info.instance}`;
        this.browseAccountEvent.next(accountName);
        return false;
    }

    openLocalAccount(): boolean {
        window.open(this.userAccount.url, '_blank');
        return false;
    }

    browseHashtag(hashtag: string): void {
        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.browseThreadEvent.next(openThreadEvent);
    }
}
