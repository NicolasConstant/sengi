import { Injectable } from "@angular/core";

@Injectable()
export class StreamingService {

  constructor() { }

  //TODO restructure this to handle real domain objects
  getStreaming(mastodonInstance: string, accessToken: string): StreamingWrapper {
    return new StreamingWrapper(mastodonInstance.replace("https://", "wss://") + `/api/v1/streaming//?access_token=${accessToken}&stream=public`)
  }

}

export class StreamingWrapper {

  constructor(private readonly domain: string) {
    const eventSource = new WebSocket(domain);
    eventSource.onmessage = x => console.warn(JSON.parse(x.data));
    eventSource.onerror = x => console.error(x);
    eventSource.onopen = x => console.log(x);
    eventSource.onclose = x => console.log(x);
  }
}
