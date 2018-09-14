import { Injectable } from "@angular/core";
import { Status } from "./models/mastodon.interfaces";
import { BehaviorSubject } from "rxjs";
import { ApiRoutes } from "./models/api.settings";

@Injectable()
export class StreamingService {
    private apiRoutes = new ApiRoutes();

    constructor() { }

    //TODO restructure this to handle real domain objects
    getStreaming(instance: string, accessToken: string, streamRequest: string): StreamingWrapper {
        const route = `wss://${instance}/api/v1/streaming?access_token=${accessToken}&stream=${streamRequest}`
        return new StreamingWrapper(route);
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
        this.eventSource.onmessage = x => this.tootParsing(<WebSocketEvent>JSON.parse(x.data));
        this.eventSource.onerror = x => console.error(x);
        this.eventSource.onopen = x => console.log(x);
        this.eventSource.onclose = x => { console.log(x); 
            setTimeout(() => {this.start(domain)}, 3000);}
    }

    private tootParsing(event: WebSocketEvent) {
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
