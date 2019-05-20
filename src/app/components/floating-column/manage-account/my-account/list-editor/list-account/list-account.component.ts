import { Component, OnInit, Input } from '@angular/core';
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";

import { Account } from "../../../../../../services/models/mastodon.interfaces";

@Component({
    selector: 'app-list-account',
    templateUrl: './list-account.component.html',
    styleUrls: ['./list-account.component.scss']
})
export class ListAccountComponent implements OnInit {
    faTimes = faTimes;
    faPlus = faPlus;

    @Input() account: Account;
    @Input() fromSearch: boolean;

    constructor() { }

    ngOnInit() {
    }

    add(): boolean {

        return false;
    }

    remove(): boolean {

        return false;
    }
}
