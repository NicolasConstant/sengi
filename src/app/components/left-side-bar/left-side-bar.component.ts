import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, BehaviorSubject, Observable } from "rxjs";
import { Store } from "@ngxs/store";

import { Account } from "../../services/models/mastodon.interfaces";
import { AccountWrapper } from "../../models/account.models";
import { AccountsService } from "../../services/accounts.service";
import { AccountsStateModel, AccountInfo } from "../../states/accounts.state";


@Component({
  selector: "app-left-side-bar",
  templateUrl: "./left-side-bar.component.html",
  styleUrls: ["./left-side-bar.component.scss"]
})
export class LeftSideBarComponent implements OnInit, OnDestroy {
  accounts: AccountWrapper[] = [];
  accounts$: Observable<AccountInfo[]>;

  private sub: Subscription;

  constructor(
    private readonly accountsService: AccountsService,
    private readonly store: Store) {

    this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
  }

  ngOnInit() {
    this.accounts$.subscribe((accounts: AccountInfo[]) => {
      console.warn(accounts);

      if (accounts) {
        this.accounts.length = 0;

        for (let acc of accounts) {
          this.accountsService.retrieveAccountDetails(acc)
            .then((result: Account) => {
              const accWrapper = new AccountWrapper();
              accWrapper.username = `${acc.username}@${acc.instance}`;
              accWrapper.avatar = result.avatar;
              this.accounts.push(accWrapper);
            });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toogleAccount(accountId: number): boolean {
    return false;
  }

  addNewAccount(): boolean {
    return false;
  }

  createNewToot(): boolean {
    return false;
  }
}
