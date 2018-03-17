import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, BehaviorSubject } from "rxjs";

import { AccountWrapper } from "../../models/account.models";
import { AccountsService, LocalAccount } from "../../services/accounts.service";

@Component({
  selector: "app-left-side-bar",
  templateUrl: "./left-side-bar.component.html",
  styleUrls: ["./left-side-bar.component.css"]
})
export class LeftSideBarComponent implements OnInit, OnDestroy {
  accounts: AccountWrapper[] = [];

  private sub: Subscription;

  constructor(
    private readonly accountsService: AccountsService) { }

  ngOnInit() {
    this.accountsService.init.then(() => {
      this.sub = this.accountsService.accountsSubject.subscribe((accounts: LocalAccount[]) => {
        this.accounts.length = 0;

        for (let acc of accounts) {
          const acc1 = new AccountWrapper();
          acc1.username = acc.mastodonAccount.username;
          acc1.avatar = acc.mastodonAccount.avatar;
          this.accounts.push(acc1);
        }
      });
    });

    //const acc1 = new AccountWrapper();
    //acc1.username = "@mastodon.social@Gargron";
    //acc1.avatar = "https://files.mastodon.social/accounts/avatars/000/000/001/original/4df197532c6b768c.png";
    //this.accounts.push(acc1);

    //const acc2 = new AccountWrapper();
    //acc2.username = "@mastodon.art@DearMsDearn";
    //acc2.avatar = "https://curate.mastodon.art/gallery/accounts/avatars/000/015/092/original/3a112863f2dd22a27764179912dc8984.gif";
    //this.accounts.push(acc2);


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
