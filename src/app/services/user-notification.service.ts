import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { Status, Notification } from './models/mastodon.interfaces';
import { MastodonService } from './mastodon.service';
import { AccountInfo } from '../states/accounts.state';
import { NotificationService } from './notification.service';
import { ToolsService } from './tools.service';

@Injectable({
    providedIn: 'root'
})
export class UserNotificationService {
    userNotifications = new BehaviorSubject<UserNotification[]>([]);

    private sinceIds: { [id: string]: string } = {};

    constructor(
        private readonly toolsService: ToolsService,
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

            currentAccountNotifications = this.analyseNotifications(account, currentAccountNotifications);

            if (currentAccountNotifications.hasNewMentions || currentAccountNotifications.hasNewNotifications) {
                currentNotifications = currentNotifications.filter(x => x.account.id !== account.id);
                currentNotifications.push(currentAccountNotifications);
                this.userNotifications.next(currentNotifications);
            }
        } else {
            let newNotifications = new UserNotification();
            newNotifications.account = account;
            newNotifications.allNotifications = notifications;

            newNotifications = this.analyseNotifications(account, newNotifications);

            currentNotifications.push(newNotifications);
            this.userNotifications.next(currentNotifications);
        }
    }

    private analyseNotifications(account: AccountInfo, userNotification: UserNotification): UserNotification {
        if (userNotification.allNotifications.length > 30) {
            userNotification.allNotifications.length = 30;
        }
        userNotification.lastId = userNotification.allNotifications[userNotification.allNotifications.length - 1].id;

        const newNotifications = userNotification.allNotifications.filter(x => x.type !== 'mention');
        const newMentions = userNotification.allNotifications.filter(x => x.type === 'mention').map(x => x.status);

        const currentNotifications = userNotification.notifications;
        const currentMentions = userNotification.mentions;

        const lastMention = newMentions[0];
        let lastMentionNotification: Notification;
        if (lastMention) {
            lastMentionNotification = userNotification.allNotifications.find(x => x.type === 'mention' && x.status.id === lastMention.id);
        }
        const lastNotification = newNotifications[0];

        userNotification.notifications = [...newNotifications, ...currentNotifications];
        userNotification.mentions = [...newMentions, ...currentMentions];

        const accountSettings = this.toolsService.getAccountSettings(account);

        if (lastMentionNotification && accountSettings.lastMentionCreationDate && new Date(lastMentionNotification.created_at) > new Date(accountSettings.lastMentionCreationDate)) {
            userNotification.hasNewMentions = true;
        } else {
            userNotification.hasNewMentions = false;
        }

        if (lastNotification && accountSettings.lastNotificationCreationDate && (new Date(lastNotification.created_at)) > new Date(accountSettings.lastNotificationCreationDate)) {
            userNotification.hasNewNotifications = true;
        } else {
            userNotification.hasNewNotifications = false;
        }

        if (!accountSettings.lastMentionCreationDate && lastMentionNotification) {           
            accountSettings.lastMentionCreationDate = lastMentionNotification.created_at;
            this.toolsService.saveAccountSettings(accountSettings);
        } 
        // else if(!accountSettings.lastMentionCreationDate){
        //     accountSettings.lastMentionCreationDate = "2000-01-01T01:01:01.000Z";
        //     this.toolsService.saveAccountSettings(accountSettings);
        // }

        if(!accountSettings.lastNotificationCreationDate && lastNotification){            
            accountSettings.lastNotificationCreationDate = lastNotification.created_at;
            this.toolsService.saveAccountSettings(accountSettings);
        } 
        // else if(!accountSettings.lastNotificationCreationDate){
        //     accountSettings.lastNotificationCreationDate = "2000-01-01T01:01:01.000Z";
        //     this.toolsService.saveAccountSettings(accountSettings);
        // }

        return userNotification;
    }

    markMentionsAsRead(account: AccountInfo) {
        let currentNotifications = this.userNotifications.value;
        const currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);

        const lastMention = currentAccountNotifications.mentions[0];        

        if (lastMention) {            
            const settings = this.toolsService.getAccountSettings(account);
            const lastMentionNotification = currentAccountNotifications.allNotifications.find(x => x.type === 'mention' && x.status.id === lastMention.id);
            settings.lastMentionCreationDate = lastMentionNotification.created_at;
            this.toolsService.saveAccountSettings(settings);
        }

        if (currentAccountNotifications.hasNewMentions === true) {
            currentAccountNotifications.hasNewMentions = false;
            this.userNotifications.next(currentNotifications);
        }
    }

    markNotificationAsRead(account: AccountInfo) {
        let currentNotifications = this.userNotifications.value;
        const currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);

        const lastNotification = currentAccountNotifications.notifications[0];
        if (lastNotification) {
            const settings = this.toolsService.getAccountSettings(account);
            settings.lastNotificationCreationDate = lastNotification.created_at;
            this.toolsService.saveAccountSettings(settings);
        }

        if (currentAccountNotifications.hasNewNotifications === true) {
            currentAccountNotifications.hasNewNotifications = false;
            this.userNotifications.next(currentNotifications);
        }
    }
}

export class UserNotification {
    account: AccountInfo;
    allNotifications: Notification[] = [];

    hasNewNotifications: boolean;
    hasNewMentions: boolean;

    notifications: Notification[] = [];
    mentions: Status[] = [];
    lastId: string;
}
