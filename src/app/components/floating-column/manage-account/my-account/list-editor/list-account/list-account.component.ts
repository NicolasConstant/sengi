import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
    @Output() addEvent = new EventEmitter();
    @Output() removeEvent = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    add(): boolean {
        this.addEvent.emit();
        return false;
    }

    remove(): boolean {
        this.removeEvent.emit();
        return false;
    }
}
