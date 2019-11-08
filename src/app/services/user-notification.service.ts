import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { Status, Notification } from './models/mastodon.interfaces';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { AccountInfo } from '../states/accounts.state';
import { NotificationService } from './notification.service';
import { ToolsService } from './tools.service';
import { StreamingService } from './streaming.service';
import { NotificationsComponent } from '../components/floating-column/manage-account/notifications/notifications.component';

@Injectable({
    providedIn: 'root'
})
export class UserNotificationService {
    userNotifications = new BehaviorSubject<UserNotification[]>([]);

    private mentionsSinceIds: { [id: string]: string } = {};
    private notificationsSinceIds: { [id: string]: string } = {};

    constructor(
        private readonly streamingService: StreamingService,
        private readonly toolsService: ToolsService,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly store: Store) {

        this.fetchNotifications();
    }

    private fetchNotifications() {
        let accounts = this.store.snapshot().registeredaccounts.accounts;
        // let promises: Promise<any>[] = [];

        accounts.forEach((account: AccountInfo) => {
            // let sinceId = null;
            // if (this.sinceIds[account.id]) {
            //     sinceId = this.sinceIds[account.id];
            // }

            this.mastodonService.getNotifications(account, ['favourite', 'follow', 'reblog', 'poll'], null, null, 10)
                .then((notifications: Notification[]) => {
                    this.processMentionsAndNotifications(account, notifications, NotificationTypeEnum.UserMention);
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err, account);
                });;

            this.mastodonService.getNotifications(account, ['mention'], null, null, 10)
                .then((notifications: Notification[]) => {
                    this.processMentionsAndNotifications(account, notifications, NotificationTypeEnum.UserNotification);
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err, account);
                });;

            //TODO: start streaming services





            // let getNotificationPromise = this.mastodonService.getNotifications(account, null, null, sinceId, 30)
            //     .then((notifications: Notification[]) => {
            //         this.processNotifications(account, notifications);
            //     })
            //     .catch(err => {
            //         this.notificationService.notifyHttpError(err, account);
            //     });
            // promises.push(getNotificationPromise);
        });

        // Promise.all(promises)
        //     .then(() => {
        //         setTimeout(() => {
        //             this.fetchNotifications();
        //         }, 15 * 1000);
        //     });
    }


    private processMentionsAndNotifications(account: AccountInfo, notifications: Notification[], type: NotificationTypeEnum) {
        if (notifications.length === 0) {
            return;
        }

        let currentNotifications = this.userNotifications.value;
        let currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);

        const sinceId = notifications[0].id;
        this.notificationsSinceIds[account.id] = sinceId;

        if (currentAccountNotifications) {
            currentAccountNotifications = this.analyseNotifications(account, currentAccountNotifications, notifications, type);

            if (currentAccountNotifications.hasNewMentions || currentAccountNotifications.hasNewNotifications) {
                currentNotifications = currentNotifications.filter(x => x.account.id !== account.id);
                currentNotifications.push(currentAccountNotifications);
                this.userNotifications.next(currentNotifications);
            }
        } else {
            let newNotifications = new UserNotification();
            newNotifications.account = account;
            newNotifications.mentions = [];
            newNotifications.notifications = [];

            newNotifications = this.analyseNotifications(account, newNotifications, notifications, type);

            currentNotifications.push(newNotifications);
            this.userNotifications.next(currentNotifications);
        }
    }

    private hasNewNotifications(lastNotification: Notification, lastCreationDate: string): boolean {    

        if(!lastNotification) return false;
        if(!lastCreationDate) return false;
        return new Date(lastNotification.created_at) > new Date(lastCreationDate);
    }

    private analyseNotifications(account: AccountInfo, userNotification: UserNotification, newNotifications: Notification[], type: NotificationTypeEnum): UserNotification {
        console.group();
        console.warn(account.username);
        console.warn(newNotifications);
        console.groupEnd();
        // if (userNotification.allNotifications.length > 30) {
        //     userNotification.allNotifications.length = 30;
        // }
        
        let lastNotificationId = newNotifications[newNotifications.length - 1].id; //FIXME: wtf? check the id retrieval
        //let lastNotificationId = newNotifications[0].id; //FIXME: wtf? check the id retrieval

        const accountSettings = this.toolsService.getAccountSettings(account);

        if (type === NotificationTypeEnum.UserMention) {
            userNotification.lastMentionsId = lastNotificationId;
            // let status = newNotifications.map(x => x.status);
            userNotification.mentions = [...newNotifications, ...userNotification.mentions];
            userNotification.hasNewMentions = this.hasNewNotifications(userNotification.mentions[0], accountSettings.lastMentionCreationDate);
        } else {
            userNotification.lastNotificationsId = lastNotificationId;
            userNotification.notifications = [...newNotifications, ...userNotification.notifications];
            userNotification.hasNewNotifications = this.hasNewNotifications(userNotification.notifications[0], accountSettings.lastNotificationCreationDate);
        }

        // userNotification.lastId = userNotification.allNotifications[userNotification.allNotifications.length - 1].id;
        // const newNotifications = userNotification.allNotifications.filter(x => x.type !== 'mention');
        // const newMentions = userNotification.allNotifications.filter(x => x.type === 'mention').map(x => x.status);

        // const currentNotifications = userNotification.notifications;
        // const currentMentions = userNotification.mentions;

        // const lastMention = newMentions[0];
        // let lastMentionNotification: Notification;
        // if (lastMention) {
        //     lastMentionNotification = userNotification.allNotifications.find(x => x.type === 'mention' && x.status.id === lastMention.id);
        // }
        // const lastNotification = newNotifications[0];
        // userNotification.notifications = [...newNotifications, ...currentNotifications];
        // userNotification.mentions = [...newMentions, ...currentMentions];

        

        if (type === NotificationTypeEnum.UserMention && !accountSettings.lastMentionCreationDate && newNotifications.length > 0) {
            accountSettings.lastMentionCreationDate = newNotifications[0].created_at;
            this.toolsService.saveAccountSettings(accountSettings);
        }

        if (type === NotificationTypeEnum.UserNotification && !accountSettings.lastNotificationCreationDate && newNotifications.length > 0) {
            accountSettings.lastNotificationCreationDate = newNotifications[0].created_at;
            this.toolsService.saveAccountSettings(accountSettings);
        }


        // if (lastMentionNotification && accountSettings.lastMentionCreationDate && new Date(lastMentionNotification.created_at) > new Date(accountSettings.lastMentionCreationDate)) {
        //     userNotification.hasNewMentions = true;
        // } else {
        //     userNotification.hasNewMentions = false;
        // }

        // if (lastNotification && accountSettings.lastNotificationCreationDate && (new Date(lastNotification.created_at)) > new Date(accountSettings.lastNotificationCreationDate)) {
        //     userNotification.hasNewNotifications = true;
        // } else {
        //     userNotification.hasNewNotifications = false;
        // }

        // if (!accountSettings.lastMentionCreationDate && lastMentionNotification) {
        //     accountSettings.lastMentionCreationDate = lastMentionNotification.created_at;
        //     this.toolsService.saveAccountSettings(accountSettings);
        // }

        // if (!accountSettings.lastNotificationCreationDate && lastNotification) {
        //     accountSettings.lastNotificationCreationDate = lastNotification.created_at;
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
            // const lastMentionNotification = currentAccountNotifications.mentions[0];
            settings.lastMentionCreationDate = lastMention.created_at;
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
    //allNotifications: Notification[] = [];

    hasNewNotifications: boolean;
    hasNewMentions: boolean;

    notifications: Notification[] = [];
    mentions: Notification[] = [];

    lastMentionsId: string;
    lastNotificationsId: string;
}

enum NotificationTypeEnum {
    UserNotification,
    UserMention
}