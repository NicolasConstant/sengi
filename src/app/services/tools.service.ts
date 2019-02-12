import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonService } from './mastodon.service';
import { Account, Results, Status } from "./models/mastodon.interfaces";
import { StatusWrapper } from '../components/stream/stream.component';


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

    getStatusUsableByAccount(account: AccountInfo, originalStatus: StatusWrapper): Promise<Status>{
        const isProvider = originalStatus.provider.id === account.id;

        let statusPromise: Promise<Status> = Promise.resolve(originalStatus.status);

        if (!isProvider) {
            statusPromise = statusPromise.then((foreignStatus: Status) => {
                const statusUrl = foreignStatus.url;
                return this.mastodonService.search(account, statusUrl)
                    .then((results: Results) => {
                        return results.statuses[0];
                    });
            });
        }

        return statusPromise;
    }

}
