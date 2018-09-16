import { Injectable } from "@angular/core";
import { Status } from "./models/mastodon.interfaces";
import { BehaviorSubject } from "rxjs";
import { ApiRoutes } from "./models/api.settings";
import { StreamTypeEnum } from "../states/streams.state";

@Injectable()
export class StreamingService {
    private apiRoutes = new ApiRoutes();

    constructor() { }

    getStreaming(instance: string, accessToken: string, streamType: StreamTypeEnum): StreamingWrapper {
        const request = this.getRequest(streamType);
        const route = `wss://${instance}/api/v1/streaming?access_token=${accessToken}&stream=${request}`
        return new StreamingWrapper(route);
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

export class StreamingWrapper {
    statusUpdateSubjet = new BehaviorSubject<StatusUpdate>(null);
    eventSource: WebSocket;

    constructor(private readonly domain: string) {
        this.start(domain);
    }

    private start(domain: string) {
        this.eventSource = new WebSocket(domain);
        this.eventSource.onmessage = x => this.statusParsing(<WebSocketEvent>JSON.parse(x.data));
        this.eventSource.onerror = x => this.webSocketGotError(x);
        this.eventSource.onopen = x => console.log(x);
        this.eventSource.onclose = x => this.webSocketClosed(domain, x);
    }

    private errorClosing: boolean;
    private webSocketGotError(x: Event) {
        console.error(x);
        this.errorClosing = true;
        // this.eventSource.close();
    }

    private webSocketClosed(domain, x: Event) {
        console.log(x);

        if(this.errorClosing){
            

            this.errorClosing = false;
        } else {
            setTimeout(() => { this.start(domain) }, 3000);
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
