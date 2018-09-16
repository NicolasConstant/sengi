import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ApiRoutes } from './models/api.settings';
import { Account } from "./models/mastodon.interfaces";
import { AccountInfo } from '../states/accounts.state';

@Injectable()
export class MastodonService {
  private apiRoutes = new ApiRoutes();

  constructor(private readonly httpClient: HttpClient) {}
  
  retrieveAccountDetails(account: AccountInfo): Promise<Account> {
    const headers = new HttpHeaders({'Authorization':`Bearer ${account.token.access_token}`});
    return this.httpClient.get<Account>('https://' + account.instance + this.apiRoutes.getCurrentAccount, {headers: headers}).toPromise();
  }
} 
