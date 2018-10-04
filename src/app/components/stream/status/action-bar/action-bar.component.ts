import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { StatusWrapper } from '../../stream.component';
import { MastodonService } from '../../../../services/mastodon.service';
import { AccountInfo } from '../../../../states/accounts.state';
import { Observable, Subscription } from 'rxjs';
import { Status, Results } from '../../../../services/models/mastodon.interfaces';
// import { map } from "rxjs/operators";

@Component({
    selector: 'app-action-bar',
    templateUrl: './action-bar.component.html',
    styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit, OnDestroy {

    @Input() statusWrapper: StatusWrapper;

    isFavorited: boolean;
    isBoosted: boolean;

    isBoostLocked: boolean;
    isLocked: boolean;

    private isProviderSelected: boolean;
    private selectedAccounts: AccountInfo[];

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonService) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        // const selectedAccounts = this.getSelectedAccounts();
        // this.checkStatus(selectedAccounts);

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            console.warn('selectedAccounts');
            this.checkStatus(accounts);
        });
    }

    ngOnDestroy(): void {
        this.accountSub.unsubscribe();
    }

    private checkStatus(accounts: AccountInfo[]): void {
        const status = this.statusWrapper.status;
        const provider = this.statusWrapper.provider;
        this.selectedAccounts = accounts.filter(x => x.isSelected);
        this.isProviderSelected = this.selectedAccounts.filter(x => x.id === provider.id).length > 0;

        if (status.visibility === 'direct' || status.visibility === 'private') {
            this.isBoostLocked = true;
        } else {
            this.isBoostLocked = false;
        }

        if ((status.visibility === 'direct' || status.visibility === 'private') && !this.isProviderSelected) {
            this.isLocked = true;
        } else {
            this.isLocked = false;
        }
    }

    reply(): boolean {
        console.warn('reply');
        return false;
    }

    boost(): boolean {
        this.selectedAccounts.forEach((account: AccountInfo) => {
            const isProvider = this.statusWrapper.provider.id === account.id;

            let pipeline: Promise<Status> = Promise.resolve(this.statusWrapper.status);

            if (!isProvider) {
                pipeline = pipeline.then((foreignStatus: Status) => {
                    const statusUrl = foreignStatus.url;
                    return this.mastodonService.search(account, statusUrl)
                        .then((results: Results) => {
                            //TODO check and type errors
                            return results.statuses[0];
                        });
                });
            }

            pipeline
                .then((status: Status) => {
                    if(this.isBoosted) {
                        return this.mastodonService.unreblog(account, status);
                    } else {
                        return this.mastodonService.reblog(account, status);
                    }
                })
                .then(() => {
                    this.isBoosted = !this.isBoosted;
                })
                .catch(err => {
                    console.error(err);
                });
        });
        
        return false;
    }

    favorite(): boolean {
        this.selectedAccounts.forEach((account: AccountInfo) => {
            const isProvider = this.statusWrapper.provider.id === account.id;

            let pipeline: Promise<Status> = Promise.resolve(this.statusWrapper.status);

            if (!isProvider) {
                pipeline = pipeline.then((foreignStatus: Status) => {
                    const statusUrl = foreignStatus.url;
                    return this.mastodonService.search(account, statusUrl)
                        .then((results: Results) => {
                            //TODO check and type errors
                            return results.statuses[0];
                        });
                });
            }

            pipeline
                .then((status: Status) => {
                    if(this.isFavorited) {
                        return this.mastodonService.unfavorite(account, status);
                    } else {
                        return this.mastodonService.favorite(account, status);
                    }
                })
                .then(() => {
                    this.isFavorited = !this.isFavorited;
                })
                .catch(err => {
                    console.error(err);
                });
        });        
        return false;
    }

    more(): boolean {
        console.warn('more');
        return false;
    }

    private getSelectedAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }
}
