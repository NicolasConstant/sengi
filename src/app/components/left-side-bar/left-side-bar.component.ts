import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, BehaviorSubject, Observable } from "rxjs";
import { Store } from "@ngxs/store";

import { Account } from "../../services/models/mastodon.interfaces";
import { AccountWrapper } from "../../models/account.models";
import { AccountsStateModel, AccountInfo, SelectAccount } from "../../states/accounts.state";
import { NavigationService, LeftPanelType } from "../../services/navigation.service";
import { MastodonService } from "../../services/mastodon.service";


@Component({
    selector: "app-left-side-bar",
    templateUrl: "./left-side-bar.component.html",
    styleUrls: ["./left-side-bar.component.scss"]
})
export class LeftSideBarComponent implements OnInit, OnDestroy {
    accounts: AccountWrapper[] = [];
    private accounts$: Observable<AccountInfo[]>;

    // private loadedAccounts: { [index: string]: AccountInfo } = {};
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
                //Update and Add
                for (let acc of accounts) {
                    const previousAcc = this.accounts.find(x => x.info.id === acc.id)
                    if (previousAcc) {
                        previousAcc.info.isSelected = acc.isSelected;
                    } else {
                        const accWrapper = new AccountWrapper();
                        accWrapper.info = acc;
                        this.accounts.push(accWrapper);

                        this.mastodonService.retrieveAccountDetails(acc)
                            .then((result: Account) => {
                                accWrapper.avatar = result.avatar;
                            });
                    }
                }

                //Delete
                const deletedAccounts = this.accounts.filter(x => accounts.findIndex(y => y.id === x.info.id) === -1);
                for(let delAcc of deletedAccounts){
                    this.accounts = this.accounts.filter(x => x.info.id !== delAcc.info.id);
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    onToogleAccountNotify(acc: AccountWrapper) {
        this.store.dispatch([new SelectAccount(acc.info)]);
    }

    onOpenMenuNotify(acc: AccountWrapper) {
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
