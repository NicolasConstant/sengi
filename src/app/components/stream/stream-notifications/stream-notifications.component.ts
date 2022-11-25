import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Notification } from '../../../services/models/mastodon.interfaces';
import { StreamElement, StreamTypeEnum } from '../../../states/streams.state';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { MastodonService } from '../../../services/mastodon.service';
import { UserNotificationService, UserNotification } from '../../../services/user-notification.service';
import { NotificationWrapper } from '../../floating-column/manage-account/notifications/notifications.component';
import { AccountInfo } from '../../../states/accounts.state';
import { NotificationService } from '../../../services/notification.service';
import { StreamingService, StatusUpdate, EventEnum } from '../../../services/streaming.service';
import { BrowseBase } from '../../common/browse-base';

@Component({
    selector: 'app-stream-notifications',
    templateUrl: './stream-notifications.component.html',
    styleUrls: ['./stream-notifications.component.scss']
})
export class StreamNotificationsComponent extends BrowseBase {
    displayingNotifications = true;
    displayingMentions = false;

    notifications: NotificationWrapper[] = [];
    mentions: NotificationWrapper[] = [];

    @Input() streamElement: StreamElement;
    @Input() goToTop: Observable<void>;

    @ViewChild('notificationstream') public notificationstream: ElementRef;
    @ViewChild('mentionstream') public mentionstream: ElementRef;

    private nbStatusPerIteration: number = 20;
    private account: AccountInfo;

    private goToTopSubscription: Subscription;
    private mentionsSubscription: Subscription;
    private notificationSubscription: Subscription;

    isMentionsLoading: boolean;
    mentionsMaxReached: boolean;
    lastMentionId: string;

    isNotificationsLoading: boolean = true;
    notificationsMaxReached: boolean;
    lastNotificationId: string;

    constructor(
        private readonly streamingService: StreamingService,
        private readonly notificationService: NotificationService,
        private readonly userNotificationService: UserNotificationService,
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) { 
            super();
        }

    ngOnInit() {
        this.goToTopSubscription = this.goToTop.subscribe(() => {
            this.applyGoToTop();
        });

        this.loadNotifications();

    }

    ngOnDestroy(): void {
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
        if (this.mentionsSubscription) this.mentionsSubscription.unsubscribe();
        if (this.notificationSubscription) this.notificationSubscription.unsubscribe();
    }

    private reduceSize(elements: NotificationWrapper[]) {
        if (elements.length > 2 * this.nbStatusPerIteration) {
            elements.length = 2 * this.nbStatusPerIteration;
        }
    }

    private applyGoToTop(): boolean {
        let stream: HTMLElement;
        if (this.displayingNotifications) {
            this.reduceSize(this.notifications);
            stream = this.notificationstream.nativeElement as HTMLElement;
        } else {
            this.reduceSize(this.mentions);
            stream = this.mentionstream.nativeElement as HTMLElement;
        }

        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);

        return false;
    }

    private loadMentions(userNotifications: UserNotification[]) {
        if (!userNotifications) return;

        let userNotification = userNotifications.find(x => x.account.id === this.account.id);

        if (!userNotification) return;

        let mentions = userNotification.mentions
            .map(x => { 
                let cwPolicy = this.toolsService.checkContentWarning(x.status);
                return new NotificationWrapper(x, this.account, cwPolicy.applyCw, cwPolicy.hide);
            })
            .reverse();
        this.lastMentionId = userNotification.lastMentionsId;

        if (!mentions) return;

        mentions.forEach(mention => {
            if (!this.mentions.find(x => x.wrapperId === mention.wrapperId)) {
                this.mentions.unshift(mention);
            }
        });
    }

    loadNotifications(): any {
        this.account = this.toolsService.getAccountById(this.streamElement.accountId);

        this.mentionsSubscription = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {            
            this.loadMentions(userNotifications);
        });

        this.mastodonService.getNotifications(this.account, null, null, null, 10)
            .then((notifications: Notification[]) => {
                this.isNotificationsLoading = false;

                this.notifications = notifications.map(x => { 
                    let cwPolicy = this.toolsService.checkContentWarning(x.status);
                    return new NotificationWrapper(x, this.account, cwPolicy.applyCw, cwPolicy.hide);
                });
                this.lastNotificationId = this.notifications[this.notifications.length - 1].notification.id;
            })
            .catch(err => {
                this.isNotificationsLoading = false;
            })
            .then(() => {
                let streamElement = new StreamElement(StreamTypeEnum.personnal, 'activity', this.account.id, null, null, null, this.account.instance);

                let streaming = this.streamingService.getStreaming(this.account, streamElement);
                this.notificationSubscription = streaming.statusUpdateSubject.subscribe((notification: StatusUpdate) => {
                    if (notification && notification.type === EventEnum.notification) {
                        let cwPolicy = this.toolsService.checkContentWarning(notification.status);
                        const n = new NotificationWrapper(notification.notification, this.account, cwPolicy.applyCw, cwPolicy.hide);
                        this.notifications.unshift(n);
                    }
                });
            })
            .catch(err => { });
    }

    select(value: 'all' | 'mentions'): boolean {
        if (value === 'all') {
            if (this.displayingNotifications === true) {
                this.applyGoToTop();
            } else {
                this.displayingMentions = false;
                setTimeout(() => {
                    this.displayingNotifications = true;
                }, 150);
            }
        } else {
            if (this.displayingMentions === true) {
                this.applyGoToTop();
            } else {
                this.displayingNotifications = false;
                setTimeout(() => {
                    this.displayingMentions = true;
                }, 150);
            }
        }
        return false;
    }

    onScroll() {
        var element = this.notificationstream.nativeElement as HTMLElement;
        if (this.displayingMentions) {
            element = this.mentionstream.nativeElement as HTMLElement;
        }

        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;

        if (atBottom) {
            if (this.displayingMentions) {
                this.mentionsScrolledToBottom();
            } else {
                this.notificationsScrolledToBottom();
            }
        }
    }

    private scrolledErrorOccured = false;
    notificationsScrolledToBottom(): any {
        if (this.isNotificationsLoading || this.notificationsMaxReached || this.notifications.length === 0 || this.scrolledErrorOccured)
            return;

        this.isNotificationsLoading = true;

        this.mastodonService.getNotifications(this.account, null, this.lastNotificationId)
            .then((result: Notification[]) => {
                if (result.length === 0) {
                    this.notificationsMaxReached = true;
                    return;
                }

                for (const s of result) {
                    let cwPolicy = this.toolsService.checkContentWarning(s.status);
                    const wrapper = new NotificationWrapper(s, this.account, cwPolicy.applyCw, cwPolicy.hide);
                    this.notifications.push(wrapper);
                }

                this.lastNotificationId = result[result.length - 1].id;
            })
            .catch(err => {
                this.scrolledErrorOccured = true;
                setTimeout(() => {
                    this.scrolledErrorOccured = false;
                }, 5000);

                this.notificationService.notifyHttpError(err, this.account);
            })
            .then(() => {
                this.isNotificationsLoading = false;
            });
    }

    mentionsScrolledToBottom(): any {
        if (this.isMentionsLoading || this.mentionsMaxReached || this.mentions.length === 0 || this.scrolledErrorOccured)
            return;

        this.isMentionsLoading = true;

        this.mastodonService.getNotifications(this.account, ['follow', 'favourite', 'reblog', 'poll', 'follow_request', 'move'], this.lastMentionId)
            .then((result: Notification[]) => {
                if (result.length === 0) {
                    this.mentionsMaxReached = true;
                    return;
                }

                for (const s of result) {
                    let cwPolicy = this.toolsService.checkContentWarning(s.status);
                    const wrapper = new NotificationWrapper(s, this.account, cwPolicy.applyCw, cwPolicy.hide);
                    this.mentions.push(wrapper);
                }

                this.lastMentionId = result[result.length - 1].id;
            })
            .catch(err => {
                this.scrolledErrorOccured = true;
                setTimeout(() => {
                    this.scrolledErrorOccured = false;
                }, 5000);

                this.notificationService.notifyHttpError(err, this.account);
            })
            .then(() => {
                this.isMentionsLoading = false;
            });
    }

    focus(): boolean {
        setTimeout(() => {
            let element: HTMLElement;
            if (this.displayingMentions) {
                element = this.mentionstream.nativeElement as HTMLElement;
            } else {
                element = this.notificationstream.nativeElement as HTMLElement;
            }
            element.focus({preventScroll:true});
        }, 0);
        return false;
    }
}
