import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { AccountWrapper } from '../../../../models/account.models';
import { OpenThreadEvent } from '../../../../services/tools.service';
import { StatusWrapper } from '../../../../models/common.model';
import { NotificationService } from '../../../../services/notification.service';
import { MastodonService } from '../../../../services/mastodon.service';
import { StreamTypeEnum } from '../../../../states/streams.state';
import { Status } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-direct-messages',
    templateUrl: '../../../stream/stream-statuses/stream-statuses.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './direct-messages.component.scss']
})
export class DirectMessagesComponent implements OnInit {
    statuses: StatusWrapper[] = [];
    displayError: string;
    isLoading = true;
    isThread = false;
    hasContentWarnings = false;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    private maxReached = false;
    private _account: AccountWrapper;

    @Input('account')
    set account(acc: AccountWrapper) {
        this._account = acc;
        this.getDirectMessages();
    }
    get account(): AccountWrapper {
        return this._account;
    }

    @ViewChild('statusstream') public statustream: ElementRef;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    private reset() {
        this.isLoading = true;
        this.statuses.length = 0;
        this.maxReached = false;
    }

    private getDirectMessages() {
        this.reset();

        this.mastodonService.getTimeline(this.account.info, StreamTypeEnum.directmessages)
            .then((statuses: Status[]) => {
                //this.maxId = statuses[statuses.length - 1].id;
                for (const s of statuses) {
                    const wrapper = new StatusWrapper(s, this.account.info);
                    this.statuses.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isLoading = false;
            });
    }

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;

        if (atBottom) {
            this.scrolledToBottom();
        }
    }

    private scrolledToBottom() {
        if (this.isLoading || this.maxReached) return;

        const maxId = this.statuses[this.statuses.length - 1].status.id;
        this.isLoading = true;
        this.mastodonService.getTimeline(this.account.info, StreamTypeEnum.directmessages, maxId)
            .then((statuses: Status[]) => {
                if (statuses.length === 0) {
                    this.maxReached = true;
                    return;
                }

                for (const s of statuses) {
                    const wrapper = new StatusWrapper(s, this.account.info);
                    this.statuses.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isLoading = false;
            });
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
