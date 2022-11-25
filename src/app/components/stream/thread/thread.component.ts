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
import { UserNotificationService, UserNotification } from '../../../services/user-notification.service';
import { TimeLineModeEnum } from '../../../states/settings.state';
import { BrowseBase } from '../../common/browse-base';
import { SettingsService } from '../../../services/settings.service';

@Component({
    selector: 'app-thread',
    templateUrl: '../stream-statuses/stream-statuses.component.html',
    styleUrls: ['../stream-statuses/stream-statuses.component.scss']
})
export class ThreadComponent extends BrowseBase {
    statuses: StatusWrapper[] = [];
    displayError: string;
    isLoading = true;
    isThread = true;
    hasContentWarnings = false;
    private remoteStatusFetchingDisabled = false;

    bufferStream: Status[] = []; //html compatibility only
    streamPositionedAtTop: boolean = true; //html compatibility only
    timelineLoadingMode: TimeLineModeEnum = TimeLineModeEnum.OnTop; //html compatibility only

    private lastThreadEvent: OpenThreadEvent;

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
    private responseSubscription: Subscription;

    constructor(
        private readonly settingsService: SettingsService,
        private readonly httpClient: HttpClient,
        private readonly notificationService: NotificationService,
        private readonly userNotificationService: UserNotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonWrapperService) { 
            super();
        }

    ngOnInit() {
        let settings = this.settingsService.getSettings();
        this.remoteStatusFetchingDisabled = settings.disableRemoteStatusFetching;

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
                const respondingStatus = this.statuses.find(x => x.status.id === replyData.uiStatusId);
                const responseStatus = replyData.response;
                if (respondingStatus && this.statuses[0]) {
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

        this.responseSubscription = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {
            userNotifications.forEach(x => {
                x.mentions.forEach(y => {
                    if(y.status){
                        if(this.statuses.map(z => z.status.id).includes(y.status.in_reply_to_id) && !this.statuses.map(z => z.status.uri).includes(y.status.uri)) {
                            let cwResult = this.toolsService.checkContentWarning(y.status);
                            this.statuses.push(new StatusWrapper(y.status, x.account, cwResult.applyCw, cwResult.hide));
                            return;
                        }
                    }
                });
            });
        });        
    }

    ngOnDestroy(): void {
        if (this.newPostSub) this.newPostSub.unsubscribe();
        if (this.hideAccountSubscription) this.hideAccountSubscription.unsubscribe();
        if (this.deleteStatusSubscription) this.deleteStatusSubscription.unsubscribe();
        if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
        if (this.responseSubscription) this.responseSubscription.unsubscribe();
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
            // var statusPromise: Promise<Status> = Promise.resolve(status);
            // if (!sourceAccount || sourceAccount.id !== currentAccount.id) {
            var statusPromise = this.toolsService.getInstanceInfo(currentAccount)
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
            // }

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

                        let localStatuses = [];
                        for (let i = 0; i < contextStatuses.length; i++) {
                            let s = contextStatuses[i];
                            let cwPolicy = this.toolsService.checkContentWarning(s);
                            const wrapper = new StatusWrapper(cwPolicy.status, currentAccount, cwPolicy.applyCw, cwPolicy.hide);

                            if (i == position) wrapper.isSelected = true;

                            // this.statuses.push(wrapper);
                            localStatuses.push(wrapper);
                        }
                        return localStatuses;
                    })
                    .then(async (localStatuses: StatusWrapper[]) => {

                        let remoteStatuses = await this.retrieveRemoteThread(status);                      
                        let unknownStatuses = remoteStatuses.filter(x => !localStatuses.find(y => y.status.uri == x.uri));

                        for(let s of unknownStatuses){            
                            let cwPolicy = this.toolsService.checkContentWarning(s);
                            let wrapper = new StatusWrapper(s, null, cwPolicy.applyCw, cwPolicy.hide);
                            wrapper.isRemote = true;
                            localStatuses.push(wrapper);
                        }    

                        localStatuses.sort((a,b) => { 
                            if(a.status.created_at > b.status.created_at) return 1;
                            if(a.status.created_at < b.status.created_at) return -1;
                            return 0;
                        });

                        this.statuses = localStatuses;
                        this.hasContentWarnings = this.statuses.filter(x => x.applyCw).length > 1;
                        let newPosition = this.statuses.findIndex(x => x.isSelected);
                        return newPosition;
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

    private async retrieveRemoteThread(status: Status): Promise<Status[]> {
        if(this.remoteStatusFetchingDisabled) return [];

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
            remoteStatuses.forEach(s => {
                if(!s.account.acct.includes('@')){
                    s.account.acct += `@${instance}`;
                }
            });            
            return remoteStatuses;
                   
        } catch (err) {
            return [];
         };
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
