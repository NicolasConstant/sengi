import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { MastodonService } from '../../../services/mastodon.service';
import { AccountInfo } from '../../../states/accounts.state';
import { Results, Account, Status } from '../../../services/models/mastodon.interfaces';


@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    @Input() searchHandle: string;

    accounts: Account[] = [];
    statuses: Status[] = [];
    hashtags: string[] = [];

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    onSubmit(): boolean {
        this.searchHandle
        this.search(this.searchHandle);
        return false;
    }

    private search(data: string) {
        this.accounts.length = 0;
        this.statuses.length = 0;
        this.hashtags.length = 0;

        console.warn(`search: ${data}`);

        const enabledAccounts = this.getRegisteredAccounts().filter(x => x.isSelected);

        //First candid implementation
        if (enabledAccounts.length > 0) {
            const candid_oneAccount = enabledAccounts[0];
            this.mastodonService.search(candid_oneAccount, data)
                .then((results: Results)=> {
                    console.warn(results);
                    this.accounts = results.accounts;
                    this.statuses = results.statuses;
                    this.hashtags = results.hashtags;
                })
                .catch((err) => console.error(err));
        }
    }

    private getRegisteredAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }
}
