import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Subject, BehaviorSubject } from "rxjs";

import { TokenData, Account } from "./models/mastodon.interfaces";
import { ApiRoutes } from "./models/api.settings";
import { AccountInfo } from "../states/accounts.state";
import { HttpClient, HttpHeaders } from "@angular/common/http";


@Injectable()
export class AccountsService {

  private apiRoutes = new ApiRoutes();

  constructor(private readonly httpClient: HttpClient) {}

  retrieveAccountDetails(account: AccountInfo): Promise<Account> {
    const headers = new HttpHeaders({'Authorization':`Bearer ${account.token.access_token}`});
    // const headers = new HttpHeaders({'Bearer':`${account.token}`});
    return this.httpClient.get<Account>('https://' + account.instance + this.apiRoutes.getCurrentAccount, {headers: headers}).toPromise();
  }

  load(): any {
  }
}