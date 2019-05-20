import { Component, OnInit, Input } from '@angular/core';

import { Account } from "../../../../../../services/models/mastodon.interfaces";

@Component({
    selector: 'app-list-account',
    templateUrl: './list-account.component.html',
    styleUrls: ['./list-account.component.scss']
})
export class ListAccountComponent implements OnInit {

    @Input() account: Account;

    constructor() { }

    ngOnInit() {
    }

}
