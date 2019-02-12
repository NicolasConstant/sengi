import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Account, Status} from "../../../services/models/mastodon.interfaces";
import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService } from '../../../services/tools.service';
import { StatusWrapper } from '../stream.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    account: Account;
    hasNote: boolean;

    isLoading: boolean;
    statusLoading: boolean;
    error: string;

    statuses: StatusWrapper[] = [];

    private accountName: string;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<string>();

    @Input('currentAccount')
    //set currentAccount(account: Account) {
    set currentAccount(accountName: string) {
        this.statuses.length = 0;
        this.isLoading = true;

        this.loadAccount(accountName)
            .then((account: Account) => {
                this.account = account;
                this.hasNote = account && account.note && account.note !== '<p></p>';
                return this.getStatuses(this.account);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isLoading = false;
                this.statusLoading = false;
            });
    }

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
    }

    browseAccount(accountName: string): void {
        this.browseAccountEvent.next(accountName);
    }

    browseHashtag(hashtag: string): void {
        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(statusUri: string): void {
        this.browseThreadEvent.next(statusUri);
    }

    private loadAccount(accountName: string): Promise<Account> {
        this.account = null;
        this.accountName = accountName;
        let selectedAccounts = this.toolsService.getSelectedAccounts();

        if (selectedAccounts.length === 0) {
            this.error = 'no user selected';
            console.error(this.error);
            return Promise.resolve(null);
        }

        this.isLoading = true;
        return this.toolsService.findAccount(selectedAccounts[0], accountName)
            .then((result) => {
                this.isLoading = false;
                return result;
            });
    }

    private getStatuses(account: Account): Promise<void> {
        let selectedAccounts = this.toolsService.getSelectedAccounts();
        if (selectedAccounts.length === 0) return;

        this.statusLoading = true;
        return this.mastodonService.getAccountStatuses(selectedAccounts[0], account.id, false, false, true, null, null, 40)
            .then((result: Status[]) => {
                for (const status of result) {
                    const wrapper = new StatusWrapper(status, selectedAccounts[0]);
                    this.statuses.push(wrapper);
                }
                this.statusLoading = false;
            });      
    }
}
