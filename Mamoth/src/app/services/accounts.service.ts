import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Subject, BehaviorSubject } from "rxjs";

import { TokenData, Account } from "./models/mastodon.interfaces";
import { ApiRoutes } from "./models/api.settings";

@Injectable()
export class AccountsService {
  private localAccountKey = "localAccounts";
  private apiRoutes = new ApiRoutes();

  accountsSubject: Subject<LocalAccount[]>;
  init: Promise<any>; //TODO load this service before any UI action

  constructor(private readonly httpService: Http) {
    this.init = this.getAllLocalAccount().then((accounts) => {
      this.accountsSubject = new BehaviorSubject<LocalAccount[]>(accounts);
    });
  }

  addNewAccount(mastodonInstance: string, email: string, token: TokenData) {
    const newAccount = new LocalAccount();
    newAccount.mastodonInstance = mastodonInstance;
    newAccount.email = email;
    newAccount.tokenData = token;

    this.getAllLocalAccount().then((allAccounts) => {
      allAccounts.push(newAccount);
      this.saveAccounts(allAccounts);

      this.accountsSubject.next(allAccounts);
    });
  }

  private getAllLocalAccount(): Promise<LocalAccount[]> {
    const allSavedAccounts = this.retrieveSavedAccounts();
    const allAccounts: LocalAccount[] = [];
    const allTasks: Promise<any>[] = [];

    for (let savedAcc of allSavedAccounts) {
      const promise = this.retrieveMastodonDetails(savedAcc)
        .then((acc) => {
          allAccounts.push(acc);
        })
        .catch(err => console.error(err));

      allTasks.push(promise);
    }

    return Promise.all(allTasks).then(() => {
      return allAccounts;
    });
  }

  private retrieveMastodonDetails(account: SavedLocalAccount): Promise<LocalAccount> {
    const localAccount = new LocalAccount();
    localAccount.mastodonInstance = account.mastodonInstance;
    localAccount.email = account.email;
    localAccount.tokenData = account.tokenData;

    const header = new Headers();
    header.append("Authorization", `Bearer ${localAccount.tokenData.access_token}`);

    return this.httpService.get(localAccount.mastodonInstance + this.apiRoutes.getCurrentAccount, { headers: header }).toPromise()
      .then((res: Response) => {
        const mastodonAccount = res.json() as Account;
        localAccount.mastodonAccount = mastodonAccount;
        return localAccount;
      });
  }

  private retrieveSavedAccounts(): SavedLocalAccount[] {
    const savedData = <SavedLocalAccount[]>JSON.parse(localStorage.getItem(this.localAccountKey));
    if (savedData) {
      return savedData;
    }
    return [];
  }

  private saveAccounts(accounts: SavedLocalAccount[]) {
    localStorage.setItem(this.localAccountKey, JSON.stringify(accounts));
  }
}

class SavedLocalAccount {
  mastodonInstance: string;
  email: string;
  tokenData: TokenData;
}

export class LocalAccount implements SavedLocalAccount {
  mastodonAccount: Account;
  mastodonInstance: string;
  email: string;
  tokenData: TokenData;
}
