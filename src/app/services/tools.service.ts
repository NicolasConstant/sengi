import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonService } from './mastodon.service';
import { Account, Results } from "./models/mastodon.interfaces";


@Injectable({
    providedIn: 'root'
})
export class ToolsService {

    constructor(
        private readonly mastodonService: MastodonService,
        private readonly store: Store) { }


    getSelectedAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts.filter(x => x.isSelected);
    }

    findAccount(account: AccountInfo, accountName: string): Promise<Account> {
        return this.mastodonService.search(account, accountName, true)
            .then((result: Results) => {
                if(accountName[0] === '@') accountName = accountName.substr(1);

                const foundAccount = result.accounts.filter(
                    x => x.acct.toLowerCase() === accountName.toLowerCase()
                    || x.acct.toLowerCase() === accountName.toLowerCase().split('@')[0]
                    )[0];
                return foundAccount;
            });
    }

}
