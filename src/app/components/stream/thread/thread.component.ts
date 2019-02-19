import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { StatusWrapper } from '../stream.component';
import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { Results, Context, Status } from '../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../services/notification.service';
import { AccountInfo } from '../../../states/accounts.state';

@Component({
    selector: 'app-thread',
    templateUrl: '../stream-statuses/stream-statuses.component.html',
    styleUrls: ['../stream-statuses/stream-statuses.component.scss']
})
export class ThreadComponent implements OnInit {
    statuses: StatusWrapper[] = [];
    isLoading: boolean;
    displayError: string;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input('currentThread')
    set currentThread(thread: OpenThreadEvent) {
        if (thread) {
            this.isLoading = true;
            this.getThread(thread);
        }
    }

    constructor(
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    private getThread(openThreadEvent: OpenThreadEvent) {
        this.statuses.length = 0;

        let currentAccount = this.toolsService.getSelectedAccounts()[0];

        const status = openThreadEvent.status;
        const sourceAccount = openThreadEvent.sourceAccount;

        if (status.visibility === 'public' || status.visibility === 'unlisted') {
            var statusPromise: Promise<Status> = Promise.resolve(status);

            if (sourceAccount.id !== currentAccount.id) {
                statusPromise = this.mastodonService.search(currentAccount, status.uri, true)
                    .then((result: Results) => {
                        if (result.statuses.length === 1) {
                            const retrievedStatus = result.statuses[0];
                            return retrievedStatus;
                        }
                        throw new Error('could not find status');
                    });
            }

            this.retrieveThread(currentAccount, statusPromise);

        } else if (sourceAccount.id === currentAccount.id) {

            var statusPromise = Promise.resolve(status);
            this.retrieveThread(currentAccount, statusPromise);

        } else {
            this.isLoading = false;
            this.displayError = `You need to use your account ${sourceAccount.username}@${sourceAccount.instance} to show this thread`;
        }
    }

    private retrieveThread(currentAccount: AccountInfo, pipeline: Promise<Status>) {
        pipeline
            .then((status: Status) => {
                this.mastodonService.getStatusContext(currentAccount, status.id)
                    .then((context: Context) => {
                        this.isLoading = false;
                        let contextStatuses = [...context.ancestors, status, ...context.descendants]

                        for (const s of contextStatuses) {
                            const wrapper = new StatusWrapper(s, currentAccount);
                            this.statuses.push(wrapper);
                        }
                    })
                    .catch((err: HttpErrorResponse) => {
                        this.isLoading = false;
                        this.notificationService.notifyHttpError(err);
                    });
            });
    }

    onScroll() {
        //Do nothing
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
