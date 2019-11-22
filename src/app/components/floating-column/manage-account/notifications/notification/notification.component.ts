import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

import { NotificationWrapper } from '../notifications.component';
import { OpenThreadEvent, ToolsService } from '../../../../../services/tools.service';
import { Account } from '../../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
    faUserPlus = faUserPlus;

    @Input() notification: NotificationWrapper;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    constructor(private readonly toolsService: ToolsService) { }

    ngOnInit() {
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

    openAccount(account: Account): boolean {
        let accountName = this.toolsService.getAccountFullHandle(account);
        this.browseAccountEvent.next(accountName);
        return false;
    }
    
    openUrl(url: string): boolean {
        window.open(url, '_blank');
        return false;
    }
}
