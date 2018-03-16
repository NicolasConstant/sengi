import { Component, OnInit } from '@angular/core';
import { AccountWrapper } from '../../models/account.models';

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.css']
})
export class LeftSideBarComponent implements OnInit {
  accounts: AccountWrapper[] = [];

  constructor() { }

  ngOnInit() {

    const acc1 = new AccountWrapper();
    acc1.username = "@mastodon.social@Gargron";
    acc1.avatar = "https://files.mastodon.social/accounts/avatars/000/000/001/original/4df197532c6b768c.png";
    this.accounts.push(acc1);

    const acc2 = new AccountWrapper();
    acc2.username = "@mastodon.art@DearMsDearn";
    acc2.avatar = "https://curate.mastodon.art/gallery/accounts/avatars/000/015/092/original/3a112863f2dd22a27764179912dc8984.gif";
    this.accounts.push(acc2);



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
