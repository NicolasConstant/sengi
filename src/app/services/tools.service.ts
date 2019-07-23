import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonService } from './mastodon.service';
import { Account, Results, Status } from "./models/mastodon.interfaces";
import { StatusWrapper } from '../models/common.model';
import { AccountSettings, SaveAccountSettings } from '../states/settings.state';

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
    
    getAccountSettings(account: AccountInfo): AccountSettings {
        var accountsSettings = <AccountSettings[]>this.store.snapshot().globalsettings.settings.accountSettings;
        let accountSettings = accountsSettings.find(x => x.accountId === account.id);
        if(!accountSettings){
            accountSettings = new AccountSettings();
            accountSettings.accountId = account.id;
            this.saveAccountSettings(accountSettings);           
        }
        if(!accountSettings.customStatusCharLength){
            accountSettings.customStatusCharLength = 500;
            this.saveAccountSettings(accountSettings);
        }
        return accountSettings;
    }

    saveAccountSettings(accountSettings: AccountSettings){
        this.store.dispatch([
            new SaveAccountSettings(accountSettings)
        ])
    }

    findAccount(account: AccountInfo, accountName: string): Promise<Account> {
        return this.mastodonService.search(account, accountName, true)
            .then((result: Results) => {
                if(accountName[0] === '@') accountName = accountName.substr(1);

                const foundAccount = result.accounts.find(
                    x => (x.acct.toLowerCase() === accountName.toLowerCase()
                    || 
                    (x.acct.toLowerCase().split('@')[0] === accountName.toLowerCase().split('@')[0])
                    && x.url.replace('https://', '').split('/')[0] === accountName.toLowerCase().split('@')[1])
                    );
                return foundAccount;
            });
    }

    getStatusUsableByAccount(account: AccountInfo, originalStatus: StatusWrapper): Promise<Status>{
        const isProvider = originalStatus.provider.id === account.id;

        let statusPromise: Promise<Status> = Promise.resolve(originalStatus.status);

        if (!isProvider) {
            statusPromise = statusPromise.then((foreignStatus: Status) => {
                const statusUrl = foreignStatus.url;
                return this.mastodonService.search(account, statusUrl, true)
                    .then((results: Results) => {
                        return results.statuses[0];
                    });
            });
        }

        return statusPromise;
    }

    getAccountFullHandle(account: Account): string {
        let fullHandle = account.acct.toLowerCase();
        if (!fullHandle.includes('@')) {
            fullHandle += `@${account.url.replace('https://', '').split('/')[0]}`;
        }
        return `@${fullHandle}`;
    }
}

export class OpenThreadEvent {
    constructor(
        public status: Status,
        public sourceAccount: AccountInfo
    ) {
    }
}
