import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject } from "rxjs";

import { Stream, StreamTypeEnum } from "../models/stream.models";
import { AccountsService, LocalAccount } from "./accounts.service";

@Injectable()
export class StreamsService {
  streamsSubject = new BehaviorSubject<Stream[]>([]);

  constructor(
    private readonly httpService: Http,
    private readonly accountsService: AccountsService) {

    // Return home/local/public of all accounts
    this.accountsService.accountsSubject
      .subscribe((accounts: LocalAccount[]) => {
        const streams: Stream[] = [];
        for (let acc of accounts) {
          const homeStream = new Stream(this.httpService, "Home", StreamTypeEnum.Home, acc);
          const localStream = new Stream(this.httpService, "Local", StreamTypeEnum.Local, acc);
          const publicStream = new Stream(this.httpService, "Public", StreamTypeEnum.Public, acc);

          streams.push(homeStream);
          streams.push(localStream);
          streams.push(publicStream);
        }
        this.streamsSubject.next(streams);
      });
  }


  //getStreams(): void {
  //  // Return home/local/public of all accounts
  //  this.accountsService.accountsSubject
  //    .map((accounts: LocalAccount[]) => {
  //      const streams: Stream[] = [];
  //      for (let acc of accounts) {
  //        const homeStream = new Stream(this.httpService, "Home", StreamTypeEnum.Home, acc);
  //        const localStream = new Stream(this.httpService, "Local", StreamTypeEnum.Local, acc); 
  //        const publicStream = new Stream(this.httpService, "Public", StreamTypeEnum.Public, acc);

  //        streams.push(homeStream);
  //        streams.push(localStream);
  //        streams.push(publicStream);
  //      }
  //      this.streamsSubject.next(streams);
  //    });
}
