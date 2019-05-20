import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";

import { Account } from "../../../../../../services/models/mastodon.interfaces";
import { AccountListWrapper } from '../list-editor.component';
import { isUndefined } from 'util';

@Component({
    selector: 'app-list-account',
    templateUrl: './list-account.component.html',
    styleUrls: ['./list-account.component.scss']
})
export class ListAccountComponent implements OnInit {
    faTimes = faTimes;
    faPlus = faPlus;

    @Input() accountWrapper: AccountListWrapper;
    @Output() addEvent = new EventEmitter<AccountListWrapper>();
    @Output() removeEvent = new EventEmitter<AccountListWrapper>();

    constructor() { }

    ngOnInit() {
    }

    add(): boolean {
        if(this.accountWrapper && this.accountWrapper.isLoading) return;
        this.addEvent.emit(this.accountWrapper);
        return false;
    }

    remove(): boolean {
        if(this.accountWrapper && this.accountWrapper.isLoading) return;
        this.removeEvent.emit(this.accountWrapper);
        return false;
    }
}
