import { Component, OnInit, Input } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { StreamWrapper } from '../my-account.component';
import { MastodonService } from '../../../../../services/mastodon.service';
import { AccountWrapper } from '../../../../../models/account.models';
import { NotificationService } from '../../../../../services/notification.service';
import { Account } from "../../../../../services/models/mastodon.interfaces";

@Component({
    selector: 'app-list-editor',
    templateUrl: './list-editor.component.html',
    styleUrls: ['./list-editor.component.scss']
})
export class ListEditorComponent implements OnInit {
    faTimes = faTimes;

    @Input() list: StreamWrapper;
    @Input() account: AccountWrapper;

    accountsInList: AccountListWrapper[] = [];
    accountsSearch: AccountListWrapper[] = [];
    searchPattern: string;
    searchOpen: boolean;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        this.accountsInList.length = 0;
        this.mastodonService.getListAccounts(this.account.info, this.list.listId)
            .then((accounts: Account[]) => {
                this.accountsInList.length = 0;
                for (const account of accounts) {
                    this.accountsInList.push(new AccountListWrapper(account, true));
                }                
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });
    }

    search(){
        if(this.searchPattern === '') 
            return this.closeSearch();

        this.searchOpen = true;
        this.accountsSearch.length = 0;
        this.mastodonService.searchAccount(this.account.info, this.searchPattern, 15)
            .then((accounts: Account[]) => {
                this.accountsSearch.length = 0;
                for (const account of accounts) {
                    this.accountsSearch.push(new AccountListWrapper(account, false));
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });
    }

    closeSearch(): boolean {
        this.searchPattern = null;
        this.searchOpen = false;
        this.accountsSearch.length = 0;
        return false;
    }
}

export class AccountListWrapper {
    constructor(public account: Account, public isInList: boolean) {
    }
    
    isProcessing: boolean;
}
