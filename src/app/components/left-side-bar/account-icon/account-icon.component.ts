import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { AccountWrapper } from '../../../models/account.models';
import { AccountWithNotificationWrapper } from '../left-side-bar.component';

@Component({
    selector: 'app-account-icon',
    templateUrl: './account-icon.component.html',
    styleUrls: ['./account-icon.component.scss']
})
export class AccountIconComponent implements OnInit {
    @Input() account: AccountWithNotificationWrapper;
    @Output() toogleAccountNotify = new EventEmitter<AccountWrapper>();
    @Output() openMenuNotify = new EventEmitter<AccountWrapper>();

    constructor() { }

    ngOnInit() {
    }

    toogleAccount(): boolean {
        this.toogleAccountNotify.emit(this.account);
        return false;
    }

    openMenu(): boolean {
        this.openMenuNotify.emit(this.account);
        return false;
    }
}
