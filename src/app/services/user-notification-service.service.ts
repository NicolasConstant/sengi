import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { Status, Notification } from './models/mastodon.interfaces';
import { MastodonService } from './mastodon.service';
import { AccountInfo } from '../states/accounts.state';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class UserNotificationServiceService {

    userNotifications = new BehaviorSubject<UserNotification[]>([]);

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService,
        private readonly store: Store) {

        this.fetchNotifications();
    }

    private fetchNotifications() {
        let accounts = this.store.snapshot().registeredaccounts.accounts;
        let promises: Promise<any>[] = [];

        accounts.forEach(account => {
            let getNotificationPromise = this.mastodonService.getNotifications(account)
                .then((notifications: Notification[]) => {
                    this.processNotifications(account, notifications);
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err);
                });
            promises.push(getNotificationPromise);
        });

        Promise.all(promises)
            .then(() => {
                setTimeout(() => {
                    this.fetchNotifications();
                }, 15 * 1000);
            });      
    }

    private processNotifications(account: AccountInfo, notifications: Notification[]) {
        let currentNotifications = this.userNotifications.value;
        const currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);

        const userNotifications = notifications.filter(x => x.type !== 'mention');
        const userMentions = notifications.filter(x => x.type === 'mention').map(x => x.status);

        if (currentAccountNotifications) {
            const currentUserNotifications = currentAccountNotifications.notifications;
            const currentUserMentions = currentAccountNotifications.mentions;

            const hasNewNotifications = (userNotifications.length === 0 && currentUserNotifications.length > 0)
                || (userNotifications.length > 0 && currentUserNotifications.length > 0) && (userNotifications[0].id !== currentUserNotifications[0].id);
            const hasNewMentions = (userMentions.length === 0 && currentUserMentions.length > 0)
                || (userMentions.length > 0 && currentUserMentions.length > 0) && (userMentions[0].id !== currentUserMentions[0].id);

            if (hasNewNotifications || hasNewMentions) {
                currentAccountNotifications.hasNewMentions = hasNewMentions;
                currentAccountNotifications.hasNewNotifications = hasNewNotifications;
                currentAccountNotifications.notifications = userNotifications;
                currentAccountNotifications.mentions = userMentions;

                currentNotifications = currentNotifications.filter(x => x.account.id !== account.id);
                currentNotifications.push(currentAccountNotifications);
                this.userNotifications.next(currentNotifications);
            }
        } else {
            const newNotifications = new UserNotification();
            newNotifications.account = account;
            newNotifications.hasNewNotifications = false; //TODO: check in local settings
            newNotifications.hasNewMentions = false; //TODO: check in local settings
            newNotifications.notifications = userNotifications;
            newNotifications.mentions = userMentions;

            currentNotifications.push(newNotifications);
            this.userNotifications.next(currentNotifications);
        }
    }
}

export class UserNotification {
    account: AccountInfo;
    hasNewNotifications: boolean;
    hasNewMentions: boolean;
    notifications: Notification[] = [];
    mentions: Status[] = [];
}
