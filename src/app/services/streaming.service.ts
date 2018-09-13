import { Injectable } from "@angular/core";
import { Status } from "./models/mastodon.interfaces";

@Injectable()
export class StreamingService {

  constructor() { }

  //TODO restructure this to handle real domain objects
  getStreaming(instance: string, accessToken: string): StreamingWrapper {
    const route = `wss://${instance}/api/v1/streaming?access_token=${accessToken}&stream=public`
    return new StreamingWrapper(route);
  }

}

export class StreamingWrapper {

  constructor(private readonly domain: string) {
    const eventSource = new WebSocket(domain);
    eventSource.onmessage = x => this.tootParsing(<WebSocketEvent>JSON.parse(x.data));
    eventSource.onerror = x => console.error(x);
    eventSource.onopen = x => console.log(x);
    eventSource.onclose = x => console.log(x);
  }

  tootParsing(event: WebSocketEvent){
    console.warn(event.event);
    console.warn(event.payload);

  }
}

class WebSocketEvent {
  event: string;
  payload: Status;
}

export class StatusUpdate {
  type: EventEnum;
  status: Status;
}

export enum EventEnum {
  unknow = 0,
  update = 1,
  delete = 2
}
