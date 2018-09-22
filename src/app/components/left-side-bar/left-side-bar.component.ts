import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, BehaviorSubject, Observable } from "rxjs";
import { Store } from "@ngxs/store";

import { Account } from "../../services/models/mastodon.interfaces";
import { AccountWrapper } from "../../models/account.models";
import { AccountsStateModel, AccountInfo } from "../../states/accounts.state";
import { NavigationService, LeftPanelType } from "../../services/navigation.service";
import { MastodonService } from "../../services/mastodon.service";


@Component({
    selector: "app-left-side-bar",
    templateUrl: "./left-side-bar.component.html",
    styleUrls: ["./left-side-bar.component.scss"]
})
export class LeftSideBarComponent implements OnInit, OnDestroy {
    accounts: AccountWrapper[] = [];
    accounts$: Observable<AccountInfo[]>;

    private loadedAccounts: { [index: string]: AccountInfo } = {};
    private sub: Subscription;

    constructor(
        private readonly navigationService: NavigationService,
        private readonly mastodonService: MastodonService,
        private readonly store: Store) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    private currentLoading: number;
    ngOnInit() {
        this.accounts$.subscribe((accounts: AccountInfo[]) => {
            if (accounts) {
                this.loadedAccounts = {};
                this.accounts.length = 0;

                for (let acc of accounts) {
                    const accWrapper = new AccountWrapper();
                    accWrapper.username = `${acc.username}@${acc.instance}`;
                    this.accounts.push(accWrapper);
                    this.loadedAccounts[accWrapper.username] = acc;

                    this.mastodonService.retrieveAccountDetails(acc)
                        .then((result: Account) => {
                            accWrapper.avatar = result.avatar;
                        });
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    onToogleAccountNotify(acc: AccountWrapper) {
        console.warn(`onToogleAccountNotify username ${acc.username}`);
    }

    onOpenMenuNotify(acc: AccountWrapper) {
        console.warn(`onOpenMenuNotify username ${acc.username}`);
        this.navigationService.openColumnEditor(acc);
    }

    createNewStatus(): boolean {
        this.navigationService.openPanel(LeftPanelType.CreateNewStatus);
        return false;
    }

    openSearch(): boolean {
        this.navigationService.openPanel(LeftPanelType.Search);
        return false;
    }
    
    addNewAccount(): boolean {
        this.navigationService.openPanel(LeftPanelType.AddNewAccount);
        return false;
    }

    openSettings(): boolean {
        this.navigationService.openPanel(LeftPanelType.Settings);
        return false;
    }
}
