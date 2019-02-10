import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StatusWrapper } from '../stream.component';
import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService } from '../../../services/tools.service';
import { Status, Results, Context } from '../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-thread',
    templateUrl: '../stream-statuses/stream-statuses.component.html',
    styleUrls: ['../stream-statuses/stream-statuses.component.scss']
})
export class ThreadComponent implements OnInit {
    statuses: StatusWrapper[] = [];
    isLoading: boolean;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<string>();

    @Input('currentThread')
    set currentThread(thread: string) {
        if (thread) {
            this.isLoading = true;
            this.getThread(thread);
        }
    }

    constructor(
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    private getThread(thread: string) {
        this.statuses.length = 0;

        let currentAccount = this.toolsService.getSelectedAccounts()[0];

        this.mastodonService.search(currentAccount, thread, true)
            .then((result: Results) => {
                if (result.statuses.length === 1) {
                    const retrievedStatus = result.statuses[0];
                    this.mastodonService.getStatusContext(currentAccount, retrievedStatus.id)
                        .then((context: Context) => {
                            this.isLoading = false;
                            let contextStatuses = [...context.ancestors, retrievedStatus, ...context.descendants]

                            for (const s of contextStatuses) {
                                const wrapper = new StatusWrapper(s, currentAccount);
                                this.statuses.push(wrapper);
                            }
                        });
                } else {
                    //TODO handle error
                    this.isLoading = false;
                    console.error('could not retrieve status');
                }
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

    browseThread(statusUri: string): void {
        this.browseThreadEvent.next(statusUri);
    }
}
