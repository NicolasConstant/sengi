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

    statuses: Status[] = [];
    private bufferStream: Status[] = [];

    @Input()
    set streamElement(streamElement: StreamElement) {
        this._streamElement = streamElement;

        const splitedUserName = streamElement.username.split('@');
        const user = splitedUserName[0];
        const instance = splitedUserName[1];
        this.account = this.getRegisteredAccounts().find(x => x.username == user && x.instance == instance);

        this.retrieveToots(); //TODO change this for WebSockets
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

    @ViewChild('statusstream') public statustream: ElementRef;
    goToTop(): boolean {
        const stream = this.statustream.nativeElement as HTMLElement;
        stream.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return false;
    }

    private streamPositionnedAtTop: boolean = true;
    private streamPositionnedAtBottom: boolean;

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
        const atTop = element.scrollTop === 0;

        this.streamPositionnedAtTop = false;
        this.streamPositionnedAtBottom = false;

        if (atBottom) {
            console.log('Bottom reached!!');
            this.streamPositionnedAtBottom = true;
        } else if (atTop) {            
            this.scrolledToTop()
        }
    }

    private scrolledToTop() {
        console.log('Top reached!!');
        this.streamPositionnedAtTop = true;
        
        for (const status of this.bufferStream) {
            this.statuses.unshift(status); //TODO check order of status 
        }

        this.bufferStream.length = 0;
    }

    private getRegisteredAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }

    private retrieveToots(): void {
        this.mastodonService.getTimeline(this.account, this._streamElement.type)
            .then((results: Status[]) => {
                for (const s of results) {
                    this.statuses.push(s);
                }
            });
    }

    

    private launchWebsocket(): void {
        this.websocketStreaming = this.streamingService.getStreaming(this.account, this._streamElement.type);
        this.websocketStreaming.statusUpdateSubjet.subscribe((update: StatusUpdate) => {
            if (update) {
                if (update.type === EventEnum.update) {
                    if (!this.statuses.find(x => x.id == update.status.id)) {
                        if (this.streamPositionnedAtTop) {
                            this.statuses.unshift(update.status);
                        } else {
                            this.bufferStream.unshift(update.status);
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
            this.bufferStream.length = 40;
        }
    }
}