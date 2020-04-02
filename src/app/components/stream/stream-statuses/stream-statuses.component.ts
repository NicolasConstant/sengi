import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { StreamElement } from '../../../states/streams.state';
import { AccountInfo } from '../../../states/accounts.state';
import { StreamingService, EventEnum, StreamingWrapper, StatusUpdate } from '../../../services/streaming.service';
import { Status } from '../../../services/models/mastodon.interfaces';
import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';
import { NotificationService } from '../../../services/notification.service';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { StatusWrapper } from '../../../models/common.model';

@Component({
    selector: 'app-stream-statuses',
    templateUrl: './stream-statuses.component.html',
    styleUrls: ['./stream-statuses.component.scss']
})
export class StreamStatusesComponent implements OnInit, OnDestroy {
    isLoading = true;
    isThread = false;
    displayError: string;
    hasContentWarnings = false;

    private _streamElement: StreamElement;
    private account: AccountInfo;
    private websocketStreaming: StreamingWrapper;

    statuses: StatusWrapper[] = [];
    bufferStream: Status[] = [];
    private bufferWasCleared: boolean;

    private hideBoosts: boolean;
    private hideReplies: boolean;
    private hideBots: boolean;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input()
    set streamElement(streamElement: StreamElement) {
        this._streamElement = streamElement;

        this.hideBoosts = streamElement.hideBoosts;
        this.hideBots = streamElement.hideBots;
        this.hideReplies = streamElement.hideReplies;

        this.load(this._streamElement);
    }
    get streamElement(): StreamElement {
        return this._streamElement;
    }

    @Input() goToTop: Observable<void>;

    @Input() userLocked = true;

    private goToTopSubscription: Subscription;
    private streamsSubscription: Subscription;
    private hideAccountSubscription: Subscription;
    private streams$: Observable<StreamElement[]>;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService,
        private readonly notificationService: NotificationService,
        private readonly streamingService: StreamingService,
        private readonly mastodonService: MastodonWrapperService) {

        this.streams$ = this.store.select(state => state.streamsstatemodel.streams);
    }

    ngOnInit() {
        this.goToTopSubscription = this.goToTop.subscribe(() => {
            this.applyGoToTop();
        });

        this.streamsSubscription = this.streams$.subscribe((streams: StreamElement[]) => {
            let updatedStream = streams.find(x => x.id === this.streamElement.id);
            if (!updatedStream) return;

            if (this.hideBoosts !== updatedStream.hideBoosts
                || this.hideBots !== updatedStream.hideBots
                || this.hideReplies !== updatedStream.hideReplies) {
                this.streamElement = updatedStream;
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

                this.bufferStream = this.bufferStream.filter(x => {
                    if (x.reblog) {
                        return x.reblog.account.url != accountUrl;
                    } else {
                        return x.account.url != accountUrl;
                    }
                });
            }
        });
    }

    ngOnDestroy() {
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
        if (this.streamsSubscription) this.streamsSubscription.unsubscribe();
        if (this.hideAccountSubscription) this.hideAccountSubscription.unsubscribe();
    }

    refresh(): any {
        this.load(this._streamElement);
    }

    private load(streamElement: StreamElement) {
        this.resetStream();

        if (this.userLocked) {
            const splitedUserName = streamElement.accountId.split('@');
            const user = splitedUserName[0];
            const instance = splitedUserName[1];
            this.account = this.getRegisteredAccounts().find(x => x.username == user && x.instance == instance);
        } else {
            this.account = this.toolsService.getSelectedAccounts()[0];
        }

        this.retrieveToots();
        this.launchWebsocket();
    }

    private resetStream() {
        this.statuses.length = 0;
        this.bufferStream.length = 0;
        if (this.websocketStreaming) this.websocketStreaming.dispose();
    }

    private launchWebsocket(): void {
        this.websocketStreaming = this.streamingService.getStreaming(this.account, this._streamElement);
        this.websocketStreaming.statusUpdateSubjet.subscribe((update: StatusUpdate) => {
            if (update) {
                if (update.type === EventEnum.update) {
                    if (!this.statuses.find(x => x.status.id == update.status.id)) {
                        if (this.streamPositionnedAtTop) {
                            if (this.isFiltered(update.status)) {
                                return;
                            }

                            let cwPolicy = this.toolsService.checkContentWarning(update.status);
                            const wrapper = new StatusWrapper(cwPolicy.status, this.account, cwPolicy.applyCw, cwPolicy.hide);
                            this.statuses.unshift(wrapper);
                        } else {
                            this.bufferStream.push(update.status);
                        }
                    }
                } else if (update.type === EventEnum.delete) {
                    this.statuses = this.statuses.filter(x => !(x.status.id === update.messageId && this.account.id === update.account.id));
                    this.bufferStream = this.bufferStream.filter(x => !(x.id === update.messageId && x.url.replace('https://', '').split('/')[0] === update.account.instance));
                }
            }

            this.checkAndCleanUpStream();
        });
    }

    @ViewChild('statusstream') public statustream: ElementRef;
    private applyGoToTop(): boolean {
        // this.loadBuffer();
        if (this.statuses.length > 2 * this.streamingService.nbStatusPerIteration) {
            this.statuses.length = 2 * this.streamingService.nbStatusPerIteration;
        }

        const stream = this.statustream.nativeElement as HTMLElement;
        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);

        return false;
    }

    private streamPositionnedAtTop: boolean = true;
    private isProcessingInfiniteScroll: boolean;

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;
        const atTop = element.scrollTop === 0;

        this.streamPositionnedAtTop = false;
        if (atBottom && !this.isProcessingInfiniteScroll) {
            this.scrolledToBottom();
        } else if (atTop) {
            this.scrolledToTop();
        }
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

    textSelected(): void {
        console.warn(`status comp: textSelected`); //TODO
    }

    private scrolledToTop() {
        this.streamPositionnedAtTop = true;

        this.loadBuffer();
    }

    private loadBuffer() {
        if (this.bufferWasCleared) {
            this.statuses.length = 0;
            this.bufferWasCleared = false;
        }

        for (const status of this.bufferStream) {
            if (this.isFiltered(status)) {
                continue;
            }

            let cwPolicy = this.toolsService.checkContentWarning(status);
            const wrapper = new StatusWrapper(cwPolicy.status, this.account, cwPolicy.applyCw, cwPolicy.hide);
            this.statuses.unshift(wrapper);
        }

        this.bufferStream.length = 0;
    }

    private scrolledToBottom() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.isProcessingInfiniteScroll = true;

        const lastStatus = this.statuses[this.statuses.length - 1];
        this.mastodonService.getTimeline(this.account, this._streamElement.type, lastStatus.status.id, null, this.streamingService.nbStatusPerIteration, this._streamElement.tag, this._streamElement.listId)
            .then((status: Status[]) => {
                for (const s of status) {
                    if (this.isFiltered(s)) {
                        continue;
                    }

                    let cwPolicy = this.toolsService.checkContentWarning(s);
                    const wrapper = new StatusWrapper(cwPolicy.status, this.account, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.push(wrapper);
                }
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, this.account);
            })
            .then(() => {
                this.isLoading = false;
                this.isProcessingInfiniteScroll = false;
            });
    }

    private getRegisteredAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }

    // @ViewChildren('status') private statusEls: QueryList<ElementRef>;
    focus(): boolean {
        setTimeout(() => {
            var element = this.statustream.nativeElement as HTMLElement;
            element.focus();
        }, 0);
        return false;
    }

    private retrieveToots(): void {
        this.mastodonService.getTimeline(this.account, this._streamElement.type, null, null, this.streamingService.nbStatusPerIteration, this._streamElement.tag, this._streamElement.listId)
            .then((results: Status[]) => {
                this.isLoading = false;
                for (const s of results) {
                    if (this.isFiltered(s)) {
                        continue;
                    }

                    let cwPolicy = this.toolsService.checkContentWarning(s);
                    const wrapper = new StatusWrapper(cwPolicy.status, this.account, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.push(wrapper);
                }
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, this.account);
            });
    }

    private checkAndCleanUpStream(): void {
        if (this.streamPositionnedAtTop && this.statuses.length > 3 * this.streamingService.nbStatusPerIteration) {
            this.statuses.length = 2 * this.streamingService.nbStatusPerIteration;
        }

        if (this.bufferStream.length > 3 * this.streamingService.nbStatusPerIteration) {
            this.bufferWasCleared = true;
            this.bufferStream.length = 2 * this.streamingService.nbStatusPerIteration;
        }
    }

    private isFiltered(status: Status): boolean {
        if (this.streamElement.hideBoosts) {
            if (status.reblog) {
                return true;
            }
        }
        if (this.streamElement.hideBots) {
            if (status.account.bot) {
                return true;
            }
        }
        if (this.streamElement.hideReplies) {
            if (status.in_reply_to_account_id && status.account.id !== status.in_reply_to_account_id) {
                return true;
            }
        }
        return false;
    }
}

