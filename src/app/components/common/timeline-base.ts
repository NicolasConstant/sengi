import { OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { MastodonWrapperService } from '../../services/mastodon-wrapper.service';
import { AccountInfo } from '../../states/accounts.state';
import { StreamingService, StreamingWrapper } from '../../services/streaming.service';
import { NotificationService } from '../../services/notification.service';
import { ToolsService, OpenThreadEvent } from '../../services/tools.service';
import { StatusWrapper } from '../../models/common.model';
import { Status } from '../../services/models/mastodon.interfaces';
import { StreamElement } from '../../states/streams.state';
import { TimeLineModeEnum } from '../../states/settings.state';

export abstract class TimelineBase implements OnInit, OnDestroy {
    isLoading = true;
    protected maxReached = false;
    isThread = false;
    displayError: string;
    hasContentWarnings = false;

    timelineLoadingMode: TimeLineModeEnum = TimeLineModeEnum.OnTop; 

    
    protected account: AccountInfo;
    protected websocketStreaming: StreamingWrapper;

    statuses: StatusWrapper[] = [];
    bufferStream: Status[] = [];
    protected bufferWasCleared: boolean;
    streamPositionnedAtTop: boolean = true;
    protected isProcessingInfiniteScroll: boolean;

    protected hideBoosts: boolean;
    protected hideReplies: boolean;
    protected hideBots: boolean;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input() goToTop: Observable<void>;

    @Input() userLocked = true;

    constructor(
        // protected readonly store: Store,
        protected readonly toolsService: ToolsService,
        protected readonly notificationService: NotificationService,
        // protected readonly streamingService: StreamingService,
        protected readonly mastodonService: MastodonWrapperService) {

        // this.streams$ = this.store.select(state => state.streamsstatemodel.streams);
    } 

    abstract ngOnInit();
    abstract ngOnDestroy();
    // protected abstract load(streamElement: StreamElement);

    protected scrolledToBottom() {
        if (this.isLoading || this.maxReached) return;

        this.isLoading = true;
        this.isProcessingInfiniteScroll = true;

        this.getNextStatuses()
            .then((status: Status[]) => {
                if (!status || status.length === 0 || this.maxReached) {
                    this.maxReached = true;
                    return;
                }

                for (const s of status) {
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

    protected abstract getNextStatuses(): Promise<Status[]>;



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