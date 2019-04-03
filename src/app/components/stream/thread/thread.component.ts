import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { Results, Context, Status } from '../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../services/notification.service';
import { AccountInfo } from '../../../states/accounts.state';
import { StatusWrapper } from '../../../models/common.model';
import { StatusComponent } from '../status/status.component';

@Component({
    selector: 'app-thread',
    templateUrl: '../stream-statuses/stream-statuses.component.html',
    styleUrls: ['../stream-statuses/stream-statuses.component.scss']
})
export class ThreadComponent implements OnInit {   
    statuses: StatusWrapper[] = [];
    displayError: string;
    isLoading = true; 
    isThread = true;
    hasContentWarnings = false;

    private lastThreadEvent: OpenThreadEvent;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input('currentThread')
    set currentThread(thread: OpenThreadEvent) {
        if (thread) {
            this.lastThreadEvent = thread;
            this.getThread(thread);
        }
    }

    @ViewChildren(StatusComponent) statusChildren: QueryList<StatusComponent>;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    private getThread(openThreadEvent: OpenThreadEvent) {
        this.statuses.length = 0;
        this.displayError = null;

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
                return this.mastodonService.getStatusContext(currentAccount, status.id)
                    .then((context: Context) => {
                        let contextStatuses = [...context.ancestors, status, ...context.descendants]

                        for (const s of contextStatuses) {
                            const wrapper = new StatusWrapper(s, currentAccount);
                            this.statuses.push(wrapper);
                        }

                        this.hasContentWarnings = this.statuses.filter(x => x.status.sensitive || x.status.spoiler_text).length > 1;
                    });
                 
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isLoading = false;
            });
    }

    refresh(): any {
        this.isLoading = true;
        this.displayError = null;
        this.statuses.length = 0;
        this.getThread(this.lastThreadEvent);
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

    removeCw(){
        const statuses = this.statusChildren.toArray();
        statuses.forEach(x => {
            x.removeContentWarning();
        });
        this.hasContentWarnings = false;
    }
}
