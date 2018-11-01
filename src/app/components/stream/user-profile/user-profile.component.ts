import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Account, Status } from "../../../services/models/mastodon.interfaces";
import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService } from '../../../services/tools.service';
import { StatusWrapper } from '../stream.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    account: Account;
    hasNote: boolean;

    statusLoading: boolean;
    statuses: StatusWrapper[] =  [];

    @Output() browseAccount = new EventEmitter<string>();
    @Output() browseHashtag = new EventEmitter<string>();

    @Input('currentAccount')
    set currentAccount(account: Account) {
        this.account = account;
        this.hasNote = account && account.note && account.note !== '<p></p>';
        console.warn('currentAccount');
        console.warn(account);
        this.getStatuses(account);
    }

    constructor(
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
    }

    accountSelected(accountName: string): void {
        this.browseAccount.next(accountName);
    }

    hashtagSelected(hashtag: string): void {
        this.browseHashtag.next(hashtag);
    }

    private getStatuses(account: Account): void {
        let selectedAccounts = this.toolsService.getSelectedAccounts();
        if (selectedAccounts.length === 0) return;

        this.statusLoading = true;
        this.mastodonService.getAccountStatuses(selectedAccounts[0], account.id, false, false, true, null, null, 40)
            .then((result: Status[]) => {
                for (const status of result) {
                    const wrapper = new StatusWrapper(status,selectedAccounts[0]);
                    this.statuses.push(wrapper);
                }
            })
            .catch(err => {

            })
            .then(() => {
                this.statusLoading = false;
            });
    }
}
