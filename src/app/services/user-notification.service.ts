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
export class UserNotificationService {
    userNotifications = new BehaviorSubject<UserNotification[]>([]);

    private sinceIds: { [id: string]: string } = {};

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService,
        private readonly store: Store) {

        this.fetchNotifications();
    }

    private fetchNotifications() {
        let accounts = this.store.snapshot().registeredaccounts.accounts;
        let promises: Promise<any>[] = [];

        accounts.forEach((account: AccountInfo) => {
            let sinceId = null;
            if (this.sinceIds[account.id]) {
                sinceId = this.sinceIds[account.id];
            }

            let getNotificationPromise = this.mastodonService.getNotifications(account, null, null, sinceId, 30)
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
        if (notifications.length === 0) {
            return;
        }

        let currentNotifications = this.userNotifications.value;
        let currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);

        const sinceId = notifications[0].id;
        this.sinceIds[account.id] = sinceId;

        if (currentAccountNotifications) {
            currentAccountNotifications.allNotifications = [...notifications, ...currentAccountNotifications.allNotifications];

            currentAccountNotifications = this.analyseNotifications(currentAccountNotifications);

            if (currentAccountNotifications.hasNewMentions || currentAccountNotifications.hasNewNotifications) {
                currentNotifications = currentNotifications.filter(x => x.account.id !== account.id);
                currentNotifications.push(currentAccountNotifications);
                this.userNotifications.next(currentNotifications);
            }
        } else {
            let newNotifications = new UserNotification();
            newNotifications.account = account;
            newNotifications.allNotifications = notifications;

            newNotifications = this.analyseNotifications(newNotifications);

            currentNotifications.push(newNotifications);
            this.userNotifications.next(currentNotifications);
        }
    }

    private analyseNotifications(userNotification: UserNotification): UserNotification {
        if(userNotification.allNotifications.length > 30){
            userNotification.allNotifications.length = 30;
        }
        userNotification.lastId =  userNotification.allNotifications[userNotification.allNotifications.length - 1].id;

        const newNotifications = userNotification.allNotifications.filter(x => x.type !== 'mention');
        const newMentions = userNotification.allNotifications.filter(x => x.type === 'mention').map(x => x.status);

        const currentNotifications = userNotification.notifications;
        const currentMentions = userNotification.mentions;

        if (!currentNotifications) {
            userNotification.notifications = newNotifications;

        } else if (currentNotifications.length === 0) {
            if (newNotifications.length > 0) {
                userNotification.hasNewNotifications = true;
            }
            userNotification.notifications = newNotifications;

        } else if (newNotifications.length > 0) {
            userNotification.hasNewNotifications = currentNotifications[0].id !== newNotifications[0].id;
            userNotification.notifications = [...newNotifications, ...currentNotifications];
        }

        if (!currentNotifications) {
            userNotification.mentions = newMentions;

        } else if (currentMentions.length === 0) {
            if (newMentions.length > 0) {
                userNotification.hasNewMentions = true;
            }
            userNotification.mentions = newMentions;

        } else if (newMentions.length > 0) {
            userNotification.hasNewMentions = currentMentions[0].id !== newMentions[0].id;
            userNotification.mentions = [...newMentions, ...currentMentions];
        }

        return userNotification;
    }

    markMentionsAsRead(account: AccountInfo) {
        let currentNotifications = this.userNotifications.value;
        const currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);
        currentAccountNotifications.hasNewMentions = false;
        this.userNotifications.next(currentNotifications);
    }

    markNotificationAsRead(account: AccountInfo) {
        let currentNotifications = this.userNotifications.value;
        const currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);
        currentAccountNotifications.hasNewNotifications = false;
        this.userNotifications.next(currentNotifications);
    }
}

export class UserNotification {
    account: AccountInfo;
    allNotifications: Notification[] = [];

    hasNewNotifications: boolean;
    hasNewMentions: boolean;

    notifications: Notification[];
    mentions: Status[];
    lastId: string;
}
