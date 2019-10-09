import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';
import { AccountInfo } from '../../../states/accounts.state';
import { Results, Account } from '../../../services/models/mastodon.interfaces';
import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { NotificationService } from '../../../services/notification.service';
import { StatusWrapper } from '../../../models/common.model';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    @Input() searchHandle: string;

    accounts: Account[] = [];
    statuses: StatusWrapper[] = [];
    hashtags: string[] = [];

    isLoading: boolean;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    constructor(
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonWrapperService) { }

    ngOnInit() {
    }

    onSubmit(): boolean {
        this.searchHandle
        this.search(this.searchHandle);
        return false;
    }

    browseHashtag(hashtag: string): boolean {
        if (hashtag) {
            this.browseHashtagEvent.next(hashtag);
        }
        return false;
    }

    browseThread(openThreadEvent: OpenThreadEvent): boolean {
        if (openThreadEvent) {
            this.browseThreadEvent.next(openThreadEvent);
        }
        return false;
    }

    browseAccount(account: Account): boolean {
        let accountName = this.toolsService.getAccountFullHandle(account);
        this.browseAccountEvent.next(accountName);
        return false;
    }

    private lastAccountUsed: AccountInfo;
    private search(data: string) {
        this.accounts.length = 0;
        this.statuses.length = 0;
        this.hashtags.length = 0;
        this.isLoading = true;

        this.lastAccountUsed = this.toolsService.getSelectedAccounts()[0];

        this.toolsService.getInstanceInfo(this.lastAccountUsed)
            .then(instance => {
                let version: 'v1' | 'v2' = 'v1';
                if (instance.major >= 3) version = 'v2';
                return this.mastodonService.search(this.lastAccountUsed, data, version, true)
            })
            .then((results: Results) => {
                if (results) {
                    this.accounts = results.accounts.slice(0, 5);
                    this.hashtags = results.hashtags;

                    for (let status of results.statuses) {
                        const statusWrapper = new StatusWrapper(status, this.lastAccountUsed);
                        this.statuses.push(statusWrapper);
                    }
                }
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, this.lastAccountUsed);
            })
            .then(() => { this.isLoading = false; });
    }

    private
}
