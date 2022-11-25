import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { Howl } from 'howler';

import { Status, Notification } from './models/mastodon.interfaces';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { AccountInfo } from '../states/accounts.state';
import { NotificationService } from './notification.service';
import { StreamingService, StatusUpdate, EventEnum } from './streaming.service';
import { StreamElement, StreamTypeEnum } from '../states/streams.state';
import { SettingsService } from './settings.service';


@Injectable({
    providedIn: 'root'
})
export class UserNotificationService {
    userNotifications = new BehaviorSubject<UserNotification[]>([]);

    // private mentionsSinceIds: { [id: string]: string } = {};
    // private notificationsSinceIds: { [id: string]: string } = {};

    private sound: Howl;
    private soundJustPlayed = false;
    private soundFileId: string;

    private accountSub: Subscription;
    private loadedAccounts: AccountInfo[] = [];

    constructor(
        private readonly settingsService: SettingsService,
        private readonly streamingService: StreamingService,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly store: Store) {

        this.fetchNotifications();
    }

    private fetchNotifications() {
        let accounts = this.store.snapshot().registeredaccounts.accounts;

        accounts.forEach((account: AccountInfo) => {
            this.loadedAccounts.push(account);
            this.startFetchingNotifications(account);
        });

        this.accountSub = this.store.select(state => state.registeredaccounts.accounts)
            .subscribe((accounts: AccountInfo[]) => {
                accounts.forEach(a => {
                    if(!this.loadedAccounts.find(x => x.id === a.id)){                        
                        this.loadedAccounts.push(a);
                        this.startFetchingNotifications(a);
                    }
                });
            });
    }

    private startFetchingNotifications(account: AccountInfo) {
        let getMentionsPromise = this.mastodonService.getNotifications(account, ['favourite', 'follow', 'reblog', 'poll', 'follow_request', 'move'], null, null, 10)
            .then((notifications: Notification[]) => {
                this.processMentionsAndNotifications(account, notifications, NotificationTypeEnum.UserMention);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, account);
            });

        let getNotificationPromise = this.mastodonService.getNotifications(account, ['mention'], null, null, 10)
            .then((notifications: Notification[]) => {
                this.processMentionsAndNotifications(account, notifications, NotificationTypeEnum.UserNotification);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, account);
            });

        Promise.all([getMentionsPromise, getNotificationPromise])
            .then(() => {
                let streamElement = new StreamElement(StreamTypeEnum.personnal, 'activity', account.id, null, null, null, account.instance);

                let streaming = this.streamingService.getStreaming(account, streamElement);
                streaming.statusUpdateSubject.subscribe((notification: StatusUpdate) => {
                    if (notification && notification.type === EventEnum.notification) {
                        this.processNewUpdate(account, notification);
                    }
                });
            })
            .catch(err => { });
    }

    private playSoundNotification() {
        const settings = this.settingsService.getSettings();
        if (settings.disableSounds) return;
        if (this.soundJustPlayed) return;
        this.soundJustPlayed = true;

        this.setNotificationSound();
        this.sound.play();

        setTimeout(() => {
            this.soundJustPlayed = false;
        }, 2000);
    }

    private setNotificationSound() {
        let settings = this.settingsService.getSettings();
        let soundId = settings.notificationSoundFileId;

        if (!soundId) {
            soundId = '0';
            settings.notificationSoundFileId = '0';
            this.settingsService.saveSettings(settings);
        }

        if (this.soundFileId === soundId) return;

        var sound = this.getAllNotificationSounds().find(x => x.id === soundId);
        this.sound = new Howl({
            src: [sound.path]
        });
        this.soundFileId = soundId;
    }

    private processNewUpdate(account: AccountInfo, notification: StatusUpdate) {
        if (!notification && !notification.notification) return;

        if (!notification.muteSound) {
            this.playSoundNotification();
        }

        if (notification.notification.type === 'mention') {
            this.processMentionsAndNotifications(account, [notification.notification], NotificationTypeEnum.UserMention);
        } else {
            this.processMentionsAndNotifications(account, [notification.notification], NotificationTypeEnum.UserNotification);
        }
    }

    private processMentionsAndNotifications(account: AccountInfo, notifications: Notification[], type: NotificationTypeEnum) {
        if (notifications.length === 0) {
            return;
        }

        let currentNotifications = this.userNotifications.value;
        let currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);

        if (currentAccountNotifications) {
            currentAccountNotifications = this.analyseNotifications(account, currentAccountNotifications, notifications, type);

            //if (currentAccountNotifications.hasNewMentions || currentAccountNotifications.hasNewNotifications) {
            currentNotifications = currentNotifications.filter(x => x.account.id !== account.id);
            currentNotifications.push(currentAccountNotifications);
            this.userNotifications.next(currentNotifications);
            //}
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
        if (!lastNotification) return false;
        if (!lastCreationDate) return false;
        return new Date(lastNotification.created_at) > new Date(lastCreationDate);
    }

    private analyseNotifications(account: AccountInfo, userNotification: UserNotification, newNotifications: Notification[], type: NotificationTypeEnum): UserNotification {

        let lastNotificationId = newNotifications[newNotifications.length - 1].id;

        const accountSettings = this.settingsService.getAccountSettings(account);

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

        // Set settings if needed
        if (type === NotificationTypeEnum.UserMention && !accountSettings.lastMentionCreationDate && newNotifications.length > 0) {
            accountSettings.lastMentionCreationDate = newNotifications[0].created_at;
            this.settingsService.saveAccountSettings(accountSettings);
        }

        if (type === NotificationTypeEnum.UserNotification && !accountSettings.lastNotificationCreationDate && newNotifications.length > 0) {
            accountSettings.lastNotificationCreationDate = newNotifications[0].created_at;
            this.settingsService.saveAccountSettings(accountSettings);
        }

        return userNotification;
    }

    markMentionsAsRead(account: AccountInfo) {
        let currentNotifications = this.userNotifications.value;
        const currentAccountNotifications = currentNotifications.find(x => x.account.id === account.id);

        const lastMention = currentAccountNotifications.mentions[0];

        if (lastMention) {
            const settings = this.settingsService.getAccountSettings(account);
            // const lastMentionNotification = currentAccountNotifications.mentions[0];
            settings.lastMentionCreationDate = lastMention.created_at;
            this.settingsService.saveAccountSettings(settings);
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
            const settings = this.settingsService.getAccountSettings(account);
            settings.lastNotificationCreationDate = lastNotification.created_at;
            this.settingsService.saveAccountSettings(settings);
        }

        if (currentAccountNotifications.hasNewNotifications === true) {
            currentAccountNotifications.hasNewNotifications = false;
            this.userNotifications.next(currentNotifications);
        }
    }

    getAllNotificationSounds(): NotificationSoundDefinition[] {
        let defs: NotificationSoundDefinition[] = [
            new NotificationSoundDefinition('0', 'assets/audio/all-eyes-on-me.mp3', 'All eyes on me'),
            new NotificationSoundDefinition('1', 'assets/audio/exquisite.mp3', 'Exquisite'),
            new NotificationSoundDefinition('2', 'assets/audio/appointed.mp3', 'Appointed'),
            new NotificationSoundDefinition('3', 'assets/audio/boop.mp3', 'Mastodon boop'),
        ];
        return defs;
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

export class NotificationSoundDefinition {

    constructor(
        public readonly id: string,
        public readonly path: string,
        public readonly name: string) { }
}