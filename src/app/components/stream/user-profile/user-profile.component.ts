import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Account } from "../../../services/models/mastodon.interfaces";

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    account: Account;
    hasNote: boolean;

    @Output() browseAccount = new EventEmitter<string>();
    @Output() browseHashtag = new EventEmitter<string>();

    @Input('currentAccount')
    set currentAccount(account: Account) {
        this.account = account;
        this.hasNote = account && account.note && account.note !== '<p></p>';
        console.warn('currentAccount');
        console.warn(account);
    }

    constructor() { }

    ngOnInit() {
    }

    accountSelected(accountName: string): void {
        this.browseAccount.next(accountName);
    }

    hashtagSelected(hashtag: string): void {
        this.browseHashtag.next(hashtag);
    }
}
