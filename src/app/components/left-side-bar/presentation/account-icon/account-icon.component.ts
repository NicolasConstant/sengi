import { Component, OnInit, Input } from '@angular/core';
import { AccountInfo } from '../../../../states/accounts.state';
import { AccountsService } from '../../../../services/accounts.service';
import { AccountWrapper } from '../../../../models/account.models';
import { Account } from "../../../../services/models/mastodon.interfaces";

@Component({
  selector: 'app-account-icon',
  templateUrl: './account-icon.component.html',
  styleUrls: ['./account-icon.component.scss']
})
export class AccountIconComponent implements OnInit {
  @Input() account: AccountWrapper;

  constructor() { }

  ngOnInit() {   
  }

  toogleAccount(): boolean {
    console.warn(`click`);
    return false;
  }

  openMenu(event): boolean {
    console.warn(`openMenu`);
    return false;    
  }
}
