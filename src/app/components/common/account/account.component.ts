import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { Account } from '../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

    @Input() account: Account;
    @Output() accountSelected = new EventEmitter<Account>();

    constructor() { }

    ngOnInit() {
    }

    selected(): boolean{
        this.accountSelected.next(this.account);
        return false;
    }
}
