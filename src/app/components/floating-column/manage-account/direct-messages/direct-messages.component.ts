import { Component, OnInit, Input } from '@angular/core';

import { AccountWrapper } from '../../../../models/account.models';

@Component({
    selector: 'app-direct-messages',
    templateUrl: './direct-messages.component.html',
    styleUrls: ['./direct-messages.component.scss']
})
export class DirectMessagesComponent implements OnInit {

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
