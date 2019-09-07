import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

import { StatusWrapper } from '../../../../models/common.model';
import { OpenThreadEvent } from '../../../../services/tools.service';
import { AccountWrapper } from '../../../../models/account.models';
import { MastodonService, FavoriteResult } from '../../../../services/mastodon.service';
import { Status } from '../../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../../services/notification.service';
import { resetCompiledComponents } from '@angular/core/src/render3/jit/module';

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
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService) { }

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
                    const wrapper = new StatusWrapper(s, this.account.info);
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
                    const wrapper = new StatusWrapper(s, this.account.info);
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
