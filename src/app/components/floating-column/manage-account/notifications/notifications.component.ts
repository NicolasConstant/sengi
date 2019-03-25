import { Component, OnInit, Input } from '@angular/core';

import { AccountWrapper } from '../../../../models/account.models';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

    @Input('account')
    set account(acc: AccountWrapper) {
        console.warn('account');
        this._account = acc;
    }
    get account(): AccountWrapper {
        return this._account;
    }

    private _account: AccountWrapper;

    constructor() { }

    ngOnInit() {
    }

}
