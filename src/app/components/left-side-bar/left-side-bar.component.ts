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

  private currentLoading: number;
  ngOnInit() {
    this.accounts$.subscribe((accounts: AccountInfo[]) => {
      console.warn(' this.accounts$.subscribe(');
      console.warn(accounts);
     

      if (accounts) {
        for (let acc of accounts) {

          const accWrapper = new AccountWrapper();
          accWrapper.username = `${acc.username}@${acc.instance}`;
          this.accounts.push(accWrapper);

          this.accountsService.retrieveAccountDetails(acc)
            .then((result: Account) => {
              console.error(result);
              const accounts = this.accounts.filter(x => result.url.includes(acc.username) && result.url.includes(acc.instance));
              for (const account of accounts) {
                account.avatar = result.avatar;
              }              
            });
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  
  addNewAccount(): boolean {
    return false;
  }

  createNewToot(): boolean {
    return false;
  }
}
