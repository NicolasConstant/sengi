import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { Results, Context, Status } from '../../../services/models/mastodon.interfaces';
import { NotificationService, NewReplyData } from '../../../services/notification.service';
import { AccountInfo } from '../../../states/accounts.state';
import { StatusWrapper } from '../../../models/common.model';
import { StatusComponent } from '../status/status.component';

@Component({
    selector: 'app-thread',
    templateUrl: '../stream-statuses/stream-statuses.component.html',
    styleUrls: ['../stream-statuses/stream-statuses.component.scss']
})
export class ThreadComponent implements OnInit, OnDestroy {
    statuses: StatusWrapper[] = [];
    displayError: string;
    isLoading = true;
    isThread = true;
    hasContentWarnings = false;

    private lastThreadEvent: OpenThreadEvent;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input() refreshEventEmitter: EventEmitter<any>;
    @Input() goToTopEventEmitter: EventEmitter<any>;

    @Input('currentThread')
    set currentThread(thread: OpenThreadEvent) {
        if (thread) {
            this.lastThreadEvent = thread;
            this.getThread(thread);
        }
    }

    @ViewChildren(StatusComponent) statusChildren: QueryList<StatusComponent>;

    private newPostSub: Subscription;
    private hideAccountSubscription: Subscription;
    private deleteStatusSubscription: Subscription;
    private refreshSubscription: Subscription;
    private goToTopSubscription: Subscription;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        if (this.refreshEventEmitter) {
            this.refreshSubscription = this.refreshEventEmitter.subscribe(() => {
                this.refresh();
            })
        }

        if (this.goToTopEventEmitter) {
            this.goToTopSubscription = this.goToTopEventEmitter.subscribe(() => {
                this.goToTop();
            })
        }

        this.newPostSub = this.notificationService.newRespondPostedStream.subscribe((replyData: NewReplyData) => {
            if (replyData) {
                const repondingStatus = this.statuses.find(x => x.status.id === replyData.uiStatusId);
                const responseStatus = replyData.response;
                if (repondingStatus && this.statuses[0]) {
                    this.statuses.push(responseStatus);
                }
            }
        });

        this.hideAccountSubscription = this.notificationService.hideAccountUrlStream.subscribe((accountUrl: string) => {
            if (accountUrl) {
                this.statuses = this.statuses.filter(x => {
                    if (x.status.reblog) {
                        return x.status.reblog.account.url != accountUrl;
                    } else {
                        return x.status.account.url != accountUrl;
                    }
                });
            }
        });

        this.deleteStatusSubscription = this.notificationService.deletedStatusStream.subscribe((status: StatusWrapper) => {
            if (status) {
                this.statuses = this.statuses.filter(x => {
                    return !(x.status.url.replace('https://', '').split('/')[0] === status.provider.instance && x.status.id === status.status.id);
                });
            }
        });
    }

    ngOnDestroy(): void {
        if (this.newPostSub) this.newPostSub.unsubscribe();
        if (this.hideAccountSubscription) this.hideAccountSubscription.unsubscribe();
        if (this.deleteStatusSubscription) this.deleteStatusSubscription.unsubscribe();
        if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
    }

    @ViewChild('statusstream') public statustream: ElementRef;
    goToTop(): any {
        const stream = this.statustream.nativeElement as HTMLElement;
        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);
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
                statusPromise = this.toolsService.getInstanceInfo(currentAccount)
                    .then(instance => {
                        let version: 'v1' | 'v2' = 'v1';
                        if (instance.major >= 3) version = 'v2';
                        return this.mastodonService.search(currentAccount, status.uri, version, true);
                    })
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
                        const position = context.ancestors.length;

                        for (const s of contextStatuses) {
                            const wrapper = new StatusWrapper(s, currentAccount);
                            this.statuses.push(wrapper);
                        }

                        this.hasContentWarnings = this.statuses.filter(x => x.status.sensitive || x.status.spoiler_text).length > 1;

                        return position;
                    });

            })
            .then((position: number) => {
                setTimeout(() => {
                    const el = this.statusChildren.toArray()[position];
                    el.isSelected = true;
                    // el.elem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                    // el.elem.nativeElement.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
                    // el.elem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                    el.elem.nativeElement.scrollIntoViewIfNeeded({ behavior: 'auto', block: 'start', inline: 'nearest' });
                }, 0);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, currentAccount);
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

    removeCw() {
        const statuses = this.statusChildren.toArray();
        statuses.forEach(x => {
            x.removeContentWarning();
        });
        this.hasContentWarnings = false;
    }
}
