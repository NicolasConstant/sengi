import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

import { Notification } from '../../../services/models/mastodon.interfaces';
import { StreamElement } from '../../../states/streams.state';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { MastodonService } from '../../../services/mastodon.service';
import { UserNotificationService } from '../../../services/user-notification.service';
import { NotificationWrapper } from '../../floating-column/manage-account/notifications/notifications.component';

@Component({
    selector: 'app-stream-notifications',
    templateUrl: './stream-notifications.component.html',
    styleUrls: ['./stream-notifications.component.scss']
})
export class StreamNotificationsComponent implements OnInit {
    
    displayingAll = true;

    notifications: NotificationWrapper[] = [];
    mentions: NotificationWrapper[] = [];

    @Input() streamElement: StreamElement;
    @Input() goToTop: Observable<void>;
        
    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @ViewChild('statusstream') public statustream: ElementRef;

    constructor(
        private readonly userNotificationService: UserNotificationService,
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
        this.loadNotifications();

    }

    loadNotifications(): any {
        const account = this.toolsService.getAccountById(this.streamElement.accountId);

        // let getMentionsPromise = this.mastodonService.getNotifications(account, ['favourite', 'follow', 'reblog', 'poll'], null, null, 10)
        //         .then((notifications: Notification[]) => {
        //            this.mentions = notifications;
        //         })
        //         .catch(err => {                    
        //         });

        let getNotificationPromise = this.mastodonService.getNotifications(account, null, null, null, 10)
                .then((notifications: Notification[]) => {
                    this.notifications = notifications.map(x => new NotificationWrapper(x, account));
                })
                .catch(err => {                    
                });
        
    }

    select(value: 'all' | 'mentions'): boolean {
        if(value === 'all'){
            this.displayingAll = true;
        } else {
            this.displayingAll = false;
        }
        return false;
    }

    onScroll() {

    }

    focus(): boolean {
        setTimeout(() => {
            var element = this.statustream.nativeElement as HTMLElement;
            element.focus();
        }, 0);
        return false;
    }
}
