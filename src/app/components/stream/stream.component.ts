import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from "@angular/core";
import { AccountWrapper } from "../../models/account.models";
import { StreamElement, StreamTypeEnum } from "../../states/streams.state";
import { StreamingService, StreamingWrapper, EventEnum, StatusUpdate } from "../../services/streaming.service";
import { Store } from "@ngxs/store";
import { AccountInfo } from "../../states/accounts.state";
import { Status } from "../../services/models/mastodon.interfaces";
import { MastodonService } from "../../services/mastodon.service";

@Component({
    selector: "app-stream",
    templateUrl: "./stream.component.html",
    styleUrls: ["./stream.component.scss"]
})
export class StreamComponent implements OnInit {
    private _streamElement: StreamElement;
    private account: AccountInfo;
    private websocketStreaming: StreamingWrapper;

    statuses: StatusWrapper[] = [];
    private bufferStream: Status[] = [];
    private bufferWasCleared: boolean;

    overlayActive: boolean;
    overlayAccountToBrowse: string;

    @Input()
    set streamElement(streamElement: StreamElement) {
        this._streamElement = streamElement;

        const splitedUserName = streamElement.accountId.split('@');
        const user = splitedUserName[0];
        const instance = splitedUserName[1];
        this.account = this.getRegisteredAccounts().find(x => x.username == user && x.instance == instance);

        this.retrieveToots();
        this.launchWebsocket();
    }

    get streamElement(): StreamElement {
        return this._streamElement;
    }

    constructor(
        private readonly store: Store,
        private readonly streamingService: StreamingService,
        private readonly mastodonService: MastodonService) {
    }

    ngOnInit() {
    }

    browseAccount(account: string): void {
        this.overlayAccountToBrowse = account;
        this.overlayActive = true;
    }

    browseHashtag(hashtag: string): void {
        console.warn('browseHashtag');
        console.warn(hashtag);
    }

    browseThread(thread: string): void {
        console.warn('browseThread');
        console.warn(thread);
    }

    closeOverlay(): void {
        this.overlayAccountToBrowse = null;
        this.overlayActive = false;
    }

    @ViewChild('statusstream') public statustream: ElementRef;
    goToTop(): boolean {
        this.loadBuffer();
        if (this.statuses.length > 40) {
            this.statuses.length = 40;
        }
        const stream = this.statustream.nativeElement as HTMLElement;
        stream.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return false;
    }

    private streamPositionnedAtTop: boolean = true;
    private isProcessingInfiniteScroll: boolean;

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight  <= element.clientHeight + element.scrollTop + 500;
        const atTop = element.scrollTop === 0;

        this.streamPositionnedAtTop = false;
        if (atBottom && !this.isProcessingInfiniteScroll) {
            this.scrolledToBottom();
        } else if (atTop) {
            this.scrolledToTop();
        }
    }

    private scrolledToTop() {
        this.streamPositionnedAtTop = true;

        this.loadBuffer();
    }

    private loadBuffer(){        
        if(this.bufferWasCleared) {
            this.statuses.length = 0;
            this.bufferWasCleared = false;
        }

        for (const status of this.bufferStream) {
            const wrapper = new StatusWrapper(status, this.account);
            this.statuses.unshift(wrapper); 
        }

        this.bufferStream.length = 0;
    }

    private scrolledToBottom() {
        this.isProcessingInfiniteScroll = true;

        const lastStatus = this.statuses[this.statuses.length - 1];
        this.mastodonService.getTimeline(this.account, this._streamElement.type, lastStatus.status.id)
            .then((status: Status[]) => {
                for (const s of status) {
                    const wrapper = new StatusWrapper(s, this.account);
                    this.statuses.push(wrapper);
                }
            })
            .catch(err => {
                console.error(err);
            })
            .then(() => {
                this.isProcessingInfiniteScroll = false;
            });
    }

    private getRegisteredAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }

    private retrieveToots(): void {
        this.mastodonService.getTimeline(this.account, this._streamElement.type)
            .then((results: Status[]) => {
                for (const s of results) {
                    const wrapper = new StatusWrapper(s, this.account);
                    this.statuses.push(wrapper);
                }
            });
    }

    private launchWebsocket(): void {
        this.websocketStreaming = this.streamingService.getStreaming(this.account, this._streamElement.type);
        this.websocketStreaming.statusUpdateSubjet.subscribe((update: StatusUpdate) => {
            if (update) {
                if (update.type === EventEnum.update) {
                    if (!this.statuses.find(x => x.status.id == update.status.id)) {
                        if (this.streamPositionnedAtTop) {
                            const wrapper = new StatusWrapper(update.status, this.account);
                            this.statuses.unshift(wrapper);
                        } else {
                            this.bufferStream.push(update.status);
                        }
                    }
                }
            }

            this.checkAndCleanUpStream();
        });
    }
    
    private checkAndCleanUpStream(): void {
        if (this.streamPositionnedAtTop && this.statuses.length > 60) {
            this.statuses.length = 40;
        }

        if (this.bufferStream.length > 60) {
            this.bufferWasCleared = true;
            this.bufferStream.length = 40;

        }
    }
}

export class StatusWrapper {
    constructor(
        public status: Status,
        public provider: AccountInfo
    ) {}    
}