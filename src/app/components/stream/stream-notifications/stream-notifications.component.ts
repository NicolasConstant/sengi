import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { Notification } from '../../../services/models/mastodon.interfaces';
import { StreamElement } from '../../../states/streams.state';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { MastodonService } from '../../../services/mastodon.service';

@Component({
    selector: 'app-stream-notifications',
    templateUrl: './stream-notifications.component.html',
    styleUrls: ['./stream-notifications.component.scss']
})
export class StreamNotificationsComponent implements OnInit {
    displayingAll = true;

    notifications: Notification[] = [];
    mentions: Notification[] = [];

    @Input() streamElement: StreamElement;
    @Input() goToTop: Observable<void>;
        
    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    constructor(
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
        this.loadNotifications();

    }

    loadNotifications(): any {
        const account = this.toolsService.getAccountById(this.streamElement.accountId);

        let getMentionsPromise = this.mastodonService.getNotifications(account, ['favourite', 'follow', 'reblog', 'poll'], null, null, 10)
                .then((notifications: Notification[]) => {
                   this.mentions = notifications;
                })
                .catch(err => {                    
                });

        let getNotificationPromise = this.mastodonService.getNotifications(account, null, null, null, 10)
                .then((notifications: Notification[]) => {
                    this.notifications = notifications;
                })
                .catch(err => {                    
                });

        throw new Error("Method not implemented.");
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
}
