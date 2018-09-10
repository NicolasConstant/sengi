import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, BehaviorSubject, Observable } from "rxjs";
import { Store } from "@ngxs/store";

import { Account } from "../../services/models/mastodon.interfaces";
import { AccountWrapper } from "../../models/account.models";
import { AccountsService } from "../../services/accounts.service";
import { AccountsStateModel, AccountInfo } from "../../states/accounts.state";
import { NavigationService } from "../../services/navigation.service";


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
    private readonly accountsService: AccountsService,
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

          this.accountsService.retrieveAccountDetails(acc)
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

  onToogleAccountNotify(username: string) {
    console.warn(`onToogleAccountNotify username ${username}`);
  }

  onOpenMenuNotify(username: string) {
    console.warn(`onOpenMenuNotify username ${username}`);
    this.navigationService.openColumnEditor(username);
  }

  createNewToot(): boolean {
    return false;
  }
}
