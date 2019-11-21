import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Notification } from '../../../services/models/mastodon.interfaces';
import { StreamElement } from '../../../states/streams.state';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { MastodonService } from '../../../services/mastodon.service';
import { UserNotificationService, UserNotification } from '../../../services/user-notification.service';
import { NotificationWrapper } from '../../floating-column/manage-account/notifications/notifications.component';
import { AccountInfo } from 'src/app/states/accounts.state';

@Component({
    selector: 'app-stream-notifications',
    templateUrl: './stream-notifications.component.html',
    styleUrls: ['./stream-notifications.component.scss']
})
export class StreamNotificationsComponent implements OnInit, OnDestroy {
    displayingNotifications = true;
    displayingMentions = false;

    notifications: NotificationWrapper[] = [];
    mentions: NotificationWrapper[] = [];

    @Input() streamElement: StreamElement;
    @Input() goToTop: Observable<void>;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @ViewChild('notificationstream') public notificationstream: ElementRef;
    @ViewChild('mentionstream') public mentionstream: ElementRef;

    private nbStatusPerIteration: number = 10;

    private goToTopSubscription: Subscription;
    private mentionsSubscription: Subscription;

    constructor(
        private readonly userNotificationService: UserNotificationService,
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
        this.goToTopSubscription = this.goToTop.subscribe(() => {
            this.applyGoToTop();
        });

        this.loadNotifications();

    }

    ngOnDestroy(): void {
        this.goToTopSubscription.unsubscribe();
        this.mentionsSubscription.unsubscribe();
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

    private loadMentions(account: AccountInfo, userNotifications: UserNotification[]) {
        if(!userNotifications) return;

        let userNotification = userNotifications.find(x => x.account.id === account.id);
        
        if(!userNotification) return;
        
        let mentions = userNotification.mentions.map(x => new NotificationWrapper(x, account)).reverse();

        if(!mentions) return;

        mentions.forEach(mention => {
            if (!this.mentions.find(x => x.wrapperId === mention.wrapperId)) {
                this.mentions.unshift(mention);
            }
        });
    }

    loadNotifications(): any {
        const account = this.toolsService.getAccountById(this.streamElement.accountId);

        this.mentionsSubscription = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {
            console.warn(userNotifications);
            this.loadMentions(account, userNotifications);
        });

        let getNotificationPromise = this.mastodonService.getNotifications(account, null, null, null, 10)
            .then((notifications: Notification[]) => {
                this.notifications = notifications.map(x => new NotificationWrapper(x, account));
            })
            .catch(err => {
            });

    }

    select(value: 'all' | 'mentions'): boolean {
        if (value === 'all') {
            this.displayingMentions = false;
            setTimeout(() => {
                this.displayingNotifications = true;
            }, 150);
        } else {
            this.displayingNotifications = false;
            setTimeout(() => {
                this.displayingMentions = true;
            }, 150);
        }
        return false;
    }

    onScroll() {

    }

    focus(): boolean {
        setTimeout(() => {
            let element: HTMLElement;
            if (this.displayingMentions) {
                element = this.mentionstream.nativeElement as HTMLElement;
            } else {
                element = this.notificationstream.nativeElement as HTMLElement;
            }
            element.focus();
        }, 0);
        return false;
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
