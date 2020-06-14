import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { faUserFriends } from "@fortawesome/free-solid-svg-icons";

import { AccountWrapper } from '../../../../models/account.models';
import { OpenThreadEvent, ToolsService } from '../../../../services/tools.service';
import { StatusWrapper } from '../../../../models/common.model';
import { NotificationService } from '../../../../services/notification.service';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { Conversation } from '../../../../services/models/mastodon.interfaces';
import { AccountInfo } from '../../../../states/accounts.state';
import { BrowseBase } from '../../../common/browse-base';

@Component({
    selector: 'app-direct-messages',
    templateUrl: './direct-messages.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './direct-messages.component.scss']
})
export class DirectMessagesComponent extends BrowseBase {   
    faUserFriends = faUserFriends;

    conversations: ConversationWrapper[] = [];
    displayError: string;
    isLoading = true;
    isThread = false;
    hasContentWarnings = false;

    private isProcessingInfiniteScroll: boolean;

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
        private readonly toolsService: ToolsService,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonWrapperService) { 
            super();
        }

    ngOnInit() {
    }

    ngOnDestroy() {
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
                    let cwPolicy = this.toolsService.checkContentWarning(c.last_status);
                    const wrapper = new ConversationWrapper(c, this.account.info, this.account.avatar, cwPolicy.applyCw, cwPolicy.hide);
                    this.conversations.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            })
            .then(() => {
                this.isLoading = false;
            });
    }

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;

        if (atBottom && !this.isProcessingInfiniteScroll) {
            this.scrolledToBottom();
        }
    }

    private scrolledToBottom() {
        if (this.isLoading || this.maxReached) return;

        const maxId = this.conversations[this.conversations.length - 1].conversation.last_status.id;
        
        this.isLoading = true;
        this.isProcessingInfiniteScroll = true;
        this.mastodonService.getConversations(this.account.info, maxId)
            .then((conversations: Conversation[]) => {
                if (conversations.length === 0) {
                    this.maxReached = true;
                    return;
                }

                for (const c of conversations) {
                    let cwPolicy = this.toolsService.checkContentWarning(c.last_status);
                    const wrapper = new ConversationWrapper(c, this.account.info, this.account.avatar, cwPolicy.applyCw, cwPolicy.hide);
                    this.conversations.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            })
            .then(() => {
                this.isLoading = false;
                this.isProcessingInfiniteScroll = false;
            });
    }

    applyGoToTop(): boolean {
        const stream = this.statustream.nativeElement as HTMLElement;
        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);
        return false;
    }
}

class ConversationWrapper {
    constructor(
        public conversation: Conversation,
        public provider: AccountInfo,
        public userAvatar: string,
        applyCw: boolean,
        hideStatus: boolean
    ) {
        this.lastStatus = new StatusWrapper(conversation.last_status, provider, applyCw, hideStatus);
    }

    lastStatus: StatusWrapper;
}