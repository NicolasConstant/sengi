import { Http, Headers, Response } from "@angular/http";
import { BehaviorSubject } from "rxjs";

import { AccountWrapper } from "./account.models";
// import { LocalAccount } from "../services/accounts.service";
import { ApiRoutes } from "../services/models/api.settings";
import { Account, Status } from "../services/models/mastodon.interfaces";
import { StreamingService, StreamingWrapper } from "../services/streaming.service";
import { StreamTypeEnum } from "../states/panels.state";

export class Stream {
  private apiRoutes = new ApiRoutes();

  statuses = new BehaviorSubject<TootWrapper[]>([]);
  
  constructor(
    private readonly httpService: Http,
    public streamName: string,
    private readonly type: StreamTypeEnum) {

    this.retrieveToots(); //TODO change this for WebSockets
  }

  private test: StreamingWrapper;
  private retrieveToots(): void {
    // //TEST
    // const service = new StreamingService();
    // this.test = service.getStreaming(this.account.mastodonInstance, this.account.tokenData.access_token);
    // //END TEST
    
    const route = this.getTimelineRoute();

    const header = new Headers();
    // header.append("Authorization", `Bearer ${this.account.tokenData.access_token}`);

    // this.httpService.get(this.account.mastodonInstance + route, { headers: header }).toPromise()
    //   .then((res: Response) => {
    //     const statuses = (res.json() as Status[])
    //       .map((status: Status) => {
    //         return new TootWrapper(status); 
    //       });
        
    //     this.statuses.next(statuses);
    //   });

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
