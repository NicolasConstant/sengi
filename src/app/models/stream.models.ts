import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Store } from "@ngxs/store";
import { BehaviorSubject } from "rxjs";

import { AccountWrapper } from "./account.models";
import { ApiRoutes } from "../services/models/api.settings";
import { Account, Status } from "../services/models/mastodon.interfaces";
import { StreamingService, StreamingWrapper, StatusUpdate, EventEnum } from "../services/streaming.service";
import { StreamTypeEnum } from "../states/streams.state";
import { AccountInfo } from "../states/accounts.state";


export class Stream {
    private apiRoutes = new ApiRoutes();
    private account: AccountInfo;
    private websocketStreaming: StreamingWrapper;

    statuses = new BehaviorSubject<TootWrapper[]>([]);

    constructor(
        private readonly streamingService: StreamingService,
        private readonly httpClient: HttpClient,
        private readonly store: Store,
        public streamName: string,
        private readonly type: StreamTypeEnum,
        username: string) {

        const splitedUserName = username.split('@');
        const user = splitedUserName[0];
        const instance = splitedUserName[1];
        this.account = this.getRegisteredAccounts().find(x => x.username == user && x.instance == instance);

        this.retrieveToots(); //TODO change this for WebSockets
        this.launchWebsocket();
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
                var statuses = results.map((status: Status) => {
                    return new TootWrapper(status);
                });

                this.statuses.next(statuses);


            });
    }

    private launchWebsocket(): void {
        //Web socket
        let streamRequest: string;
        switch (this.type) {
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
                    this.statuses.next([new TootWrapper(update.status)]);
                }
            }
        });

    }

    private getTimelineRoute(): string {
        switch (this.type) {
            case StreamTypeEnum.personnal:
                return this.apiRoutes.getHomeTimeline;
            case StreamTypeEnum.local:
                return this.apiRoutes.getPublicTimeline + `?Local=true`;
            case StreamTypeEnum.global:
                return this.apiRoutes.getPublicTimeline + `?Local=false`;
        }
    }

}

// export enum StreamTypeEnum {
//   Home,
//   Public,
//   Local
// }


export class TootWrapper {
    constructor(status: Status) {
        this.account = new AccountWrapper();
        this.account.username = status.account.username;
        this.account.display_name = status.account.display_name;
        this.account.avatar = status.account.avatar;

        this.content = status.content;
    }

    account: AccountWrapper; //TODO change to Account
    content: string;
}
