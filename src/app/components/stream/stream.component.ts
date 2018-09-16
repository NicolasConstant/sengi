import { Component, OnInit, Input } from "@angular/core";
import { AccountWrapper } from "../../models/account.models";
import { StreamElement, StreamTypeEnum } from "../../states/streams.state";
import { StreamingService, StreamingWrapper, EventEnum, StatusUpdate } from "../../services/streaming.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Store } from "@ngxs/store";
import { AccountInfo } from "../../states/accounts.state";
import { ApiRoutes } from "../../services/models/api.settings";
import { Status } from "../../services/models/mastodon.interfaces";

@Component({
    selector: "app-stream",
    templateUrl: "./stream.component.html",
    styleUrls: ["./stream.component.scss"]
})
export class StreamComponent implements OnInit {
    private _streamElement: StreamElement;
    private apiRoutes = new ApiRoutes();
    private account: AccountInfo;
    private websocketStreaming: StreamingWrapper;

    statuses: Status[] = [];

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
        private readonly httpClient: HttpClient) {
    }

    ngOnInit() {
    }

    goToTop(): boolean {
        return false;
    }

    private getTimelineRoute(): string {
        switch (this._streamElement.type) {
            case StreamTypeEnum.personnal:
                return this.apiRoutes.getHomeTimeline;
            case StreamTypeEnum.local:
                return this.apiRoutes.getPublicTimeline + `?Local=true`;
            case StreamTypeEnum.global:
                return this.apiRoutes.getPublicTimeline + `?Local=false`;
        }
    }

    private getRegisteredAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }


    private retrieveToots(): void {
        const route = `https://${this.account.instance}${this.getTimelineRoute()}`;

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.account.token.access_token}` });
        this.httpClient.get<Status[]>(route, { headers: headers }).toPromise()
            .then((results: Status[]) => {
                for (const s of results) {
                    this.statuses.push(s);
                }
            });
    }

    private launchWebsocket(): void {
        //Web socket
        let streamRequest: string;
        switch (this._streamElement.type) {
            case StreamTypeEnum.global:
                streamRequest = 'public';
                break;
            case StreamTypeEnum.local:
                streamRequest = 'public:local';
                break;
            case StreamTypeEnum.personnal:
                streamRequest = 'user';
                break;
        }

        this.websocketStreaming = this.streamingService.getStreaming(this.account.instance, this.account.token.access_token, streamRequest);
        this.websocketStreaming.statusUpdateSubjet.subscribe((update: StatusUpdate) => {
            if (update) {
                if (update.type === EventEnum.update) {
                    this.statuses.unshift(update.status);
                }
            }
        });
    }
}