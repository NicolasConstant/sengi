import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { Status } from "./models/mastodon.interfaces";
import { ApiRoutes } from "./models/api.settings";
import { StreamTypeEnum, StreamElement } from "../states/streams.state";
import { MastodonService } from "./mastodon.service";
import { AccountInfo } from "../states/accounts.state";

@Injectable()
export class StreamingService {

    public readonly nbStatusPerIteration: number = 20;

    constructor(
        private readonly mastodonService: MastodonService) { }

    getStreaming(accountInfo: AccountInfo, stream: StreamElement): StreamingWrapper {

        console.warn('EventSourceStreaminWrapper');
        new EventSourceStreaminWrapper(accountInfo, stream);

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
        this.eventSource.onmessage = x => {
            if (x.data !== '') {
                this.statusParsing(<WebSocketEvent>JSON.parse(x.data));
            }
        }
        this.eventSource.onerror = x => this.webSocketGotError(x);
        this.eventSource.onopen = x => { };
        this.eventSource.onclose = x => this.webSocketClosed(route, x);
    }

    private webSocketGotError(x: Event) {
        this.errorClosing = true;
    }

    private webSocketClosed(domain, x: Event) {
        if (this.errorClosing) {
            setTimeout(() => {
                this.pullNewStatuses(domain);
                this.errorClosing = false;
            }, 60 * 1000);
        } else if (!this.disposed) {
            setTimeout(() => { this.start(domain) }, 60 * 1000);
        }
    }

    private pullNewStatuses(domain) {
        this.mastodonService.getTimeline(this.account, this.stream.type, null, this.since_id, this.nbStatusPerIteration, this.stream.tag, this.stream.listId)
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
                    setTimeout(() => { this.pullNewStatuses(domain) }, 60 * 1000);
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
                newUpdate.account = this.account;
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
        if (stream.list) route = `${route}&list=${stream.listId}`;

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

export class EventSourceStreaminWrapper {
    eventSource: EventSource;
    private apiRoutes = new ApiRoutes();

    constructor(
        private readonly account: AccountInfo,
        private readonly stream: StreamElement
    ){
        this.start();
    }

    private start(){
        const route = this.getRoute();
        this.eventSource = new EventSource(route);
        this.eventSource.addEventListener('update', u => {
            console.warn('update');
            console.warn(u);
        });
        this.eventSource.addEventListener('delete', d => {
            console.warn('delete');
            console.warn(d);
        });
        this.eventSource.onmessage = x => {
            console.log(x);
            if(x.data !== ''){
                this.onMessage(JSON.parse(x.data));
            }
        };
        this.eventSource.onerror = x => {
            this.onError(x);
        };    
        
        console.warn('this.eventSource.CONNECTING');
        console.warn(this.eventSource.CONNECTING);
        console.warn('this.eventSource.OPEN');
        console.warn(this.eventSource.OPEN);

    }   

    private onMessage(data) {
        console.warn('onMessage');
        console.warn(data);
    }

    private onError(data) {
        console.warn('onError');
        console.warn(data);
    }

    private getRoute(): string {
        const streamingRouteType = this.getStreamingRouteType(this.stream.type);
        let route = `https://${this.account.instance}/api/v1/streaming/${streamingRouteType}?access_token=${this.account.token.access_token}`;
        return route;
    }

    private getStreamingRouteType(type: StreamTypeEnum): string {
        switch (type) {
            case StreamTypeEnum.global:
                return 'public';
            case StreamTypeEnum.local:
                return 'public/local';
            case StreamTypeEnum.personnal:
                return 'user';
            case StreamTypeEnum.directmessages:
                return 'direct';
            case StreamTypeEnum.tag:
                return 'hashtag?tag={0}';
            case StreamTypeEnum.list:
                return 'list?list={0}';
            case StreamTypeEnum.directmessages:
                return 'direct';
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
    messageId: string;
    account: AccountInfo;
}

export enum EventEnum {
    unknow = 0,
    update = 1,
    delete = 2
}
