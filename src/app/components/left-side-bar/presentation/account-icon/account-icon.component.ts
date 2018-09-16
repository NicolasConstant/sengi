import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AccountWrapper } from '../../../../models/account.models';

@Component({
  selector: 'app-account-icon',
  templateUrl: './account-icon.component.html',
  styleUrls: ['./account-icon.component.scss']
})
export class AccountIconComponent implements OnInit {
  @Input() account: AccountWrapper;
  @Output() toogleAccountNotify = new EventEmitter<AccountWrapper>();
  @Output() openMenuNotify = new EventEmitter<AccountWrapper>();

  isSelected: boolean = false;

  constructor() { }

  ngOnInit() {   
  }

  toogleAccount(): boolean {
    this.toogleAccountNotify.emit(this.account);
    this.isSelected = !this.isSelected;
    return false;
  }

  openMenu(): boolean {
    this.openMenuNotify.emit(this.account);
    return false;    
  }
}
