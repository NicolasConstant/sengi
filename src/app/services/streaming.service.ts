import { Injectable } from "@angular/core";
import { Status } from "./models/mastodon.interfaces";
import { BehaviorSubject } from "rxjs";
import { ApiRoutes } from "./models/api.settings";
import { StreamTypeEnum, StreamElement } from "../states/streams.state";
import { MastodonService } from "./mastodon.service";
import { AccountInfo } from "../states/accounts.state";
import { stat } from "fs";

@Injectable()
export class StreamingService {

    public readonly nbStatusPerIteration: number = 20;

    constructor(
        private readonly mastodonService: MastodonService) { }

    getStreaming(accountInfo: AccountInfo, stream: StreamElement): StreamingWrapper {
        return new StreamingWrapper(this.mastodonService, accountInfo, stream, this.nbStatusPerIteration);
    }


}

export class StreamingWrapper {
    statusUpdateSubjet = new BehaviorSubject<StatusUpdate>(null);
    eventSource: WebSocket;
    private apiRoutes = new ApiRoutes();
    private errorClosing: boolean;
    private since_id: string;
    private disposed: boolean;

    constructor(
        private readonly mastodonService: MastodonService,
        private readonly account: AccountInfo,
        private readonly stream: StreamElement,
        private readonly nbStatusPerIteration: number) {

        const route = this.getRoute(account, stream);
        this.start(route);
    }

    dispose(): any {
        this.disposed = true;
        this.eventSource.close();
    }

    private start(route: string) {
        this.eventSource = new WebSocket(route);
        this.eventSource.onmessage = x => this.statusParsing(<WebSocketEvent>JSON.parse(x.data));
        this.eventSource.onerror = x => this.webSocketGotError(x);
        this.eventSource.onopen = x => console.log(x);
        this.eventSource.onclose = x => this.webSocketClosed(route, x);
    }

    private webSocketGotError(x: Event) {
        this.errorClosing = true;
    }

    private webSocketClosed(domain, x: Event) {
        if (this.errorClosing) {
            this.pullNewStatuses(domain);
            this.errorClosing = false;
        } else if (!this.disposed) {
            setTimeout(() => { this.start(domain) }, 5000);
        }
    }

    private pullNewStatuses(domain) {
        this.mastodonService.getTimeline(this.account, this.stream.type, null, this.since_id, this.nbStatusPerIteration, this.stream.tag, this.stream.list)
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
                // setTimeout(() => { this.start(domain) }, 20 * 1000);
                if (!this.disposed) {
                    setTimeout(() => { this.pullNewStatuses(domain) }, 15 * 1000);
                }
            });
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

    private getRoute(account: AccountInfo, stream: StreamElement): string {
        const streamingRouteType = this.getStreamingRouteType(stream.type);
        let route = `wss://${account.instance}${this.apiRoutes.getStreaming}`.replace('{0}', account.token.access_token).replace('{1}', streamingRouteType);

        if (stream.tag) route = `${route}&tag=${stream.tag}`;
        if (stream.list) route = `${route}&tag=${stream.list}`;

        return route;
    }

    private getStreamingRouteType(type: StreamTypeEnum): string {
        switch (type) {
            case StreamTypeEnum.global:
                return 'public';
            case StreamTypeEnum.local:
                return 'public:local';
            case StreamTypeEnum.personnal:
                return 'user';
            case StreamTypeEnum.directmessages:
                return 'direct';
            case StreamTypeEnum.tag:
                return 'hashtag';
            case StreamTypeEnum.list:
                return 'list';
            default:
                throw Error('Not supported');
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
