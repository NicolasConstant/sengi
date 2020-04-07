import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';
import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { Results, Context, Status } from '../../../services/models/mastodon.interfaces';
import { NotificationService, NewReplyData } from '../../../services/notification.service';
import { AccountInfo } from '../../../states/accounts.state';
import { StatusWrapper } from '../../../models/common.model';
import { StatusComponent } from '../status/status.component';
import scrollIntoView from 'scroll-into-view-if-needed';

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

    bufferStream: Status[] = []; //html compatibility only

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
        private readonly httpClient: HttpClient,
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonWrapperService) { }

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

            if (!sourceAccount || sourceAccount.id !== currentAccount.id) {
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

        } else if (sourceAccount && sourceAccount.id === currentAccount.id) {
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

                        for (let i = 0; i < contextStatuses.length; i++) {
                            let s = contextStatuses[i];
                            let cwPolicy = this.toolsService.checkContentWarning(s);
                            const wrapper = new StatusWrapper(cwPolicy.status, currentAccount, cwPolicy.applyCw, cwPolicy.hide);

                            if (i == position) wrapper.isSelected = true;

                            this.statuses.push(wrapper);
                        }

                        this.hasContentWarnings = this.statuses.filter(x => x.applyCw).length > 1;

                        return position;
                    })
                    .then((position: number) => {
                        this.retrieveRemoteThread(status);
                        return position;
                    });
            })
            .then((position: number) => {
                setTimeout(() => {
                    const el = this.statusChildren.toArray()[position];
                    //el.elem.nativeElement.scrollIntoViewIfNeeded({ behavior: 'auto', block: 'start', inline: 'nearest' });                    
                    scrollIntoView(el.elem.nativeElement, { behavior: 'smooth', block: 'nearest' });
                }, 250);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, currentAccount);
            })
            .then(() => {
                this.isLoading = false;
            });
    }

    private async retrieveRemoteThread(status: Status) {
        try {
            let url = status.url;
            let splitUrl = url.replace('https://', '').split('/');            
            let id = splitUrl[splitUrl.length - 1];
            let instance = splitUrl[0];

            //Pleroma
            if(url.includes('/objects/')){ 
                var webpage = await this.httpClient.get(url, { responseType: 'text' }).toPromise();
                id = webpage.split(`<meta content="https://${instance}/notice/`)[1].split('" property="og:url"')[0];
            }           
            
            let context = await this.mastodonService.getRemoteStatusContext(instance, id);
            let remoteStatuses = [...context.ancestors, ...context.descendants];

            let unknownStatuses = remoteStatuses.filter(x => !this.statuses.find(y => y.status.url == x.url));
                        
            for(let s of unknownStatuses){
                //TODO fetch settings
                let wrapper = new StatusWrapper(s, null, false, false);
                wrapper.isRemote = true;
                this.statuses.push(wrapper);
                this.statuses.sort((a,b) => { 
                    if(a.status.created_at > b.status.created_at) return 1;
                    if(a.status.created_at < b.status.created_at) return -1;
                    return 0;
                });
            }            
        } catch (err) { };
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

    removeCw(): boolean {
        const statuses = this.statusChildren.toArray();
        statuses.forEach(x => {
            x.removeContentWarning();
            if (x.isSelected) {
                setTimeout(() => {
                    scrollIntoView(x.elem.nativeElement, { behavior: 'auto', block: 'nearest' });
                }, 0);
            }
        });
        this.hasContentWarnings = false;
        return false;
    }
}
