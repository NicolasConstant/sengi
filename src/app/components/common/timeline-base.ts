import { OnInit, Input, OnDestroy, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MastodonWrapperService } from '../../services/mastodon-wrapper.service';
import { AccountInfo } from '../../states/accounts.state';
import { StreamingWrapper } from '../../services/streaming.service';
import { NotificationService } from '../../services/notification.service';
import { ToolsService, OpenThreadEvent } from '../../services/tools.service';
import { StatusWrapper } from '../../models/common.model';
import { Status } from '../../services/models/mastodon.interfaces';
import { TimeLineModeEnum } from '../../states/settings.state';
import { BrowseBase } from './browse-base';

export abstract class TimelineBase extends BrowseBase {
    isLoading = true;
    protected maxReached = false;
    protected lastCallReachedMax = false;
    isThread = false;
    displayError: string;
    hasContentWarnings = false;

    timelineLoadingMode: TimeLineModeEnum = TimeLineModeEnum.OnTop;

    protected account: AccountInfo;
    protected websocketStreaming: StreamingWrapper;

    statuses: StatusWrapper[] = [];
    bufferStream: Status[] = [];
    protected bufferWasCleared: boolean;
    streamPositionedAtTop: boolean = true;
    protected isProcessingInfiniteScroll: boolean;

    protected hideBoosts: boolean;
    protected hideReplies: boolean;
    protected hideBots: boolean;

    @Input() goToTop: Observable<void>;

    @Input() userLocked = true;

    @ViewChild('statusstream') public statustream: ElementRef;

    constructor(
        protected readonly toolsService: ToolsService,
        protected readonly notificationService: NotificationService,
        protected readonly mastodonService: MastodonWrapperService) {
        super();
    }

    abstract ngOnInit();
    abstract ngOnDestroy();
    protected abstract scrolledToTop();
    protected abstract statusProcessOnGoToTop();
    protected abstract getNextStatuses(): Promise<Status[]>;

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;
        const atTop = element.scrollTop === 0;

        this.streamPositionedAtTop = false;
        if (atBottom && !this.isProcessingInfiniteScroll) {
            this.scrolledToBottom();
        } else if (atTop) {
            this.scrolledToTop();
        }
    }

    private scrolledErrorOccured = false;
    protected scrolledToBottom() {
        if (this.isLoading || this.maxReached || this.scrolledErrorOccured) return;

        this.isLoading = true;
        this.isProcessingInfiniteScroll = true;

        this.getNextStatuses()
            .then((status: Status[]) => {
                if (!status || status.length === 0 || this.maxReached) {
                    this.maxReached = true;
                    return;
                }

                if (status) {
                    for (const s of status) {
                        let cwPolicy = this.toolsService.checkContentWarning(s);
                        const wrapper = new StatusWrapper(cwPolicy.status, this.account, cwPolicy.applyCw, cwPolicy.hide);
                        this.statuses.push(wrapper);
                    }
                }

                if(this.lastCallReachedMax){
                    this.maxReached = true;
                }
            })
            .catch((err: HttpErrorResponse) => {
                this.scrolledErrorOccured = true;
                setTimeout(() => {
                    this.scrolledErrorOccured = false;
                }, 5000);

                this.notificationService.notifyHttpError(err, this.account);
            })
            .then(() => {
                this.isLoading = false;
                this.isProcessingInfiniteScroll = false;
            });
    }

    applyGoToTop(): boolean {
        this.statusProcessOnGoToTop();

        const stream = this.statustream.nativeElement as HTMLElement;
        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);
        return false;
    }
}