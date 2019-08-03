import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";

import { AccountWrapper } from '../../../../models/account.models';
import { OpenThreadEvent } from '../../../../services/tools.service';
import { StatusWrapper } from '../../../../models/common.model';
import { NotificationService } from '../../../../services/notification.service';
import { MastodonService } from '../../../../services/mastodon.service';
import { Conversation } from '../../../../services/models/mastodon.interfaces';
import { AccountInfo } from '../../../../states/accounts.state';

@Component({
    selector: 'app-direct-messages',
    templateUrl: './direct-messages.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './direct-messages.component.scss']
})
export class DirectMessagesComponent implements OnInit {
    faUserFriends = faUserFriends;

    conversations: ConversationWrapper[] = [];
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
        this.conversations.length = 0;
        this.maxReached = false;
    }

    private getDirectMessages() {
        this.reset();

        this.mastodonService.getConversations(this.account.info)
            .then((conversations: Conversation[]) => {
                for (const c of conversations) {
                    const wrapper = new ConversationWrapper(c, this.account.info, this.account.avatar);
                    this.conversations.push(wrapper);
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

        const maxId = this.conversations[this.conversations.length - 1].conversation.last_status.id;
        
        this.isLoading = true;
        this.mastodonService.getConversations(this.account.info, maxId)
            .then((conversations: Conversation[]) => {
                if (conversations.length === 0) {
                    this.maxReached = true;
                    return;
                }

                for (const c of conversations) {
                    const wrapper = new ConversationWrapper(c, this.account.info, this.account.avatar);
                    this.conversations.push(wrapper);
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

class ConversationWrapper {

    constructor(
        public conversation: Conversation,
        public provider: AccountInfo,
        public userAvatar: string
    ) {
        this.lastStatus = new StatusWrapper(conversation.last_status, provider);
    }

    lastStatus: StatusWrapper;
}