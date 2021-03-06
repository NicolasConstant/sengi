import { Component, OnInit, Input } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { StreamWrapper } from '../my-account.component';
import { MastodonWrapperService } from '../../../../../services/mastodon-wrapper.service';
import { AccountWrapper } from '../../../../../models/account.models';
import { NotificationService } from '../../../../../services/notification.service';
import { Account, Relationship, Instance } from "../../../../../services/models/mastodon.interfaces";
import { SettingsService } from '../../../../../services/settings.service';

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
        private readonly settingsService: SettingsService,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonWrapperService) { }

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
                this.notificationService.notifyHttpError(err, this.account.info);
            });
    }

    search() {
        if (this.searchPattern === '')
            return this.closeSearch();

        this.searchOpen = true;
        this.accountsSearch.length = 0;
        this.mastodonService.searchAccount(this.account.info, this.searchPattern, 15)
            .then((accounts: Account[]) => {
                this.accountsSearch.length = 0;
                for (const account of accounts) {
                    const isInList = this.accountsInList.filter(x => x.account.id === account.id).length > 0;
                    this.accountsSearch.push(new AccountListWrapper(account, isInList));
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            });
    }

    closeSearch(): boolean {
        this.searchPattern = null;
        this.searchOpen = false;
        this.accountsSearch.length = 0;
        return false;
    }

    addEvent(accountWrapper: AccountListWrapper) {
        const settings = this.settingsService.getSettings();

        accountWrapper.isLoading = true;
        this.mastodonService.getInstance(this.account.info.instance)
            .then((instance: Instance) => {
                if (instance.version.toLowerCase().includes('pleroma') && !settings.autoFollowOnListEnabled) {
                    return Promise.resolve(true);
                } else {
                    return this.followAccount(accountWrapper);
                }
            })             
            .then(() => {
                return this.mastodonService.addAccountToList(this.account.info, this.list.listId, accountWrapper.account.id);
            })
            .then(() => {
                accountWrapper.isInList = true;
                this.accountsInList.push(accountWrapper);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            })
            .then(() => {
                accountWrapper.isLoading = false;
            });
    }

    private followAccount(accountWrapper: AccountListWrapper): Promise<boolean> {
        return this.mastodonService.getRelationships(this.account.info, [accountWrapper.account])
            .then((relationships: Relationship[]) => {
                var relationship = relationships.filter(x => x.id === accountWrapper.account.id)[0];
                return relationship;
            })
            .then((relationship: Relationship) => {
                if (relationship.following) {
                    return Promise.resolve(true);
                } else {
                    return this.mastodonService.follow(this.account.info, accountWrapper.account)
                        .then((relationship: Relationship) => {
                            return new Promise<boolean>((resolve) => setTimeout(resolve, 1500));
                            // return Promise.resolve(relationship.following);
                        });
                }
            })
    }

    // private delay(t, v) {
    //     return new Promise(function(resolve) { 
    //         setTimeout(resolve.bind(null, v), t)
    //     });
    //  }

    removeEvent(accountWrapper: AccountListWrapper) {
        console.log(accountWrapper);

        accountWrapper.isLoading = true;
        this.mastodonService.removeAccountFromList(this.account.info, this.list.listId, accountWrapper.account.id)
            .then(() => {
                accountWrapper.isInList = false;
                this.accountsInList = this.accountsInList.filter(x => x.account.id !== accountWrapper.account.id);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account.info);
            })
            .then(() => {
                accountWrapper.isLoading = false;
            });
    }
}

export class AccountListWrapper {
    constructor(public account: Account, public isInList: boolean) {
    }

    isProcessing: boolean;
    isLoading: boolean;
}
