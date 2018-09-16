import { Injectable } from "@angular/core";
import { Status } from "./models/mastodon.interfaces";
import { BehaviorSubject } from "rxjs";
import { ApiRoutes } from "./models/api.settings";
import { StreamTypeEnum } from "../states/streams.state";
import { MastodonService } from "./mastodon.service";
import { AccountInfo } from "../states/accounts.state";
import { stat } from "fs";

@Injectable()
export class StreamingService {
    constructor(
        private readonly mastodonService: MastodonService) { }

    getStreaming(accountInfo: AccountInfo, streamType: StreamTypeEnum): StreamingWrapper {
        return new StreamingWrapper(this.mastodonService, accountInfo, streamType);
    }


}

export class StreamingWrapper {
    statusUpdateSubjet = new BehaviorSubject<StatusUpdate>(null);
    eventSource: WebSocket;
    private apiRoutes = new ApiRoutes();

    constructor(
        private readonly mastodonService: MastodonService,
        private readonly accountInfo: AccountInfo,
        private readonly streamType: StreamTypeEnum) {

        const request = this.getRequest(streamType);
        const route = `wss://${accountInfo.instance}${this.apiRoutes.getStreaming}`.replace('{0}', accountInfo.token.access_token).replace('{1}', request);
        this.start(route);
    }

    private start(route: string) {
        this.eventSource = new WebSocket(route);
        this.eventSource.onmessage = x => this.statusParsing(<WebSocketEvent>JSON.parse(x.data));
        this.eventSource.onerror = x => this.webSocketGotError(x);
        this.eventSource.onopen = x => console.log(x);
        this.eventSource.onclose = x => this.webSocketClosed(route, x);
    }

    private errorClosing: boolean;
    private webSocketGotError(x: Event) {
        this.errorClosing = true;
    }

    private since_id: string;
    private webSocketClosed(domain, x: Event) {
        console.log(x);

        if (this.errorClosing) {
            this.mastodonService.getTimeline(this.accountInfo, this.streamType, null, this.since_id)
                .then((status: Status[]) => {
                    // status = status.sort((n1, n2) => {  return (<number>n1.id) < (<number>n2.id); });
                    status = status.sort((a, b) => a.id.localeCompare(b.id));
                    for (const s of status) {
                        const update = new StatusUpdate();
                        update.status = s;
                        update.type = EventEnum.update;
                        this.since_id = update.status.id;
                        this.statusUpdateSubjet.next(update);
                    }
                })
                .catch(err => {
                    console.error(err);
                })
                .then(() => {
                    setTimeout(() => { this.start(domain) }, 20 * 1000);
                });

            this.errorClosing = false;
        } else {
            setTimeout(() => { this.start(domain) }, 5000);
        }
    }

    private statusParsing(event: WebSocketEvent) {
        const newUpdate = new StatusUpdate();

        switch (event.event) {
            case 'update':
                newUpdate.type = EventEnum.update;
                newUpdate.status = <Status>JSON.parse(event.payload);
                break;
            case 'delete':
                newUpdate.type = EventEnum.delete;
                newUpdate.messageId = event.payload;
                break;
            default:
                newUpdate.type = EventEnum.unknow;
        }

        this.statusUpdateSubjet.next(newUpdate);
    }

    private getRequest(type: StreamTypeEnum): string {
        switch (type) {
            case StreamTypeEnum.global:
                return 'public';
            case StreamTypeEnum.local:
                return 'public:local';
            case StreamTypeEnum.personnal:
                return 'user';
        }
    }
}

class WebSocketEvent {
    event: string;
    payload: any;
}

export class StatusUpdate {
    type: EventEnum;
    status: Status;
    messageId: number;
}

export enum EventEnum {
    unknow = 0,
    update = 1,
    delete = 2
}
