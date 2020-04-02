import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

import { StatusWrapper } from '../../../../models/common.model';
import { OpenThreadEvent, ToolsService } from '../../../../services/tools.service';
import { AccountWrapper } from '../../../../models/account.models';
import { FavoriteResult } from '../../../../services/mastodon.service';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { Status } from '../../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-favorites',
    templateUrl: '../../../stream/stream-statuses/stream-statuses.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
    statuses: StatusWrapper[] = [];
    displayError: string;
    isLoading = true;
    isThread = false;
    hasContentWarnings = false;

    bufferStream: Status[] = []; //html compatibility only

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    private maxReached = false;
    private maxId: string;
    private _account: AccountWrapper;

    @Input('account')
    set account(acc: AccountWrapper) {
        this._account = acc;
        this.getFavorites();
    }
    get account(): AccountWrapper {
        return this._account;
    }

    @ViewChild('statusstream') public statustream: ElementRef;

    constructor(
        private readonly toolsService: ToolsService,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonWrapperService) { }

    ngOnInit() {
    }

    private reset(){
        this.isLoading = true;
        this.statuses.length = 0;
        this.maxReached = false;
        this.maxId = null;
    }

    private getFavorites() {
        this.reset();

        this.mastodonService.getFavorites(this.account.info)
            .then((result: FavoriteResult) => {
                this.maxId = result.max_id;
                for (const s of result.favorites) {
                    let cwPolicy = this.toolsService.checkContentWarning(s);
                    const wrapper = new StatusWrapper(cwPolicy.status, this.account.info, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.push(wrapper);
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

        if (atBottom) {
            this.scrolledToBottom();
        }
    }


    private scrolledToBottom() {
        if (this.isLoading || this.maxReached) return;

        this.isLoading = true;
        this.mastodonService.getFavorites(this.account.info, this.maxId)
            .then((result: FavoriteResult) => {
                const statuses = result.favorites;
                if (statuses.length === 0 || !this.maxId) {
                    this.maxReached = true;
                    return;
                }

                this.maxId = result.max_id;
                for (const s of statuses) {
                    let cwPolicy = this.toolsService.checkContentWarning(s);
                    const wrapper = new StatusWrapper(cwPolicy.status, this.account.info, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
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
