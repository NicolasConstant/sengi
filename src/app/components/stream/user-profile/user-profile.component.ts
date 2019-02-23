import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { faUser, faHourglassHalf, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { faUser as faUserRegular } from "@fortawesome/free-regular-svg-icons";
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { Account, Status, Relationship } from "../../../services/models/mastodon.interfaces";
import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { StatusWrapper } from '../stream.component';
import { NotificationService } from '../../../services/notification.service';
import { AccountInfo } from '../../../states/accounts.state';



@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    faUser = faUser;
    faUserRegular = faUserRegular;
    faHourglassHalf = faHourglassHalf;
    faUserCheck = faUserCheck;

    account: Account;
    hasNote: boolean;

    isLoading: boolean;
    statusLoading: boolean;
    error: string;

    relationship: Relationship;
    statuses: StatusWrapper[] = [];

    private lastAccountName: string;

    private currentlyUsedAccount: AccountInfo;
    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input('currentAccount')
    set currentAccount(accountName: string) {
        this.load(accountName);
    }

    constructor(
        private readonly store: Store,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            if (this.account) {
                this.relationship = null;
                const userAccount = accounts.filter(x => x.isSelected)[0];                

                this.toolsService.findAccount(userAccount, this.lastAccountName)
                    .then((account: Account) => {
                        this.getFollowStatus(userAccount, account);
                    })
                    .catch((err: HttpErrorResponse) => {
                        this.notificationService.notifyHttpError(err);
                    });       
            }
        });
    }

    ngOnDestroy() {
        this.accountSub.unsubscribe();
    }

    private load(accountName: string) {
        this.statuses.length = 0;

        this.account = null;
        this.isLoading = true;

        this.lastAccountName = accountName;
        this.currentlyUsedAccount = this.toolsService.getSelectedAccounts()[0];

        return this.toolsService.findAccount(this.currentlyUsedAccount, this.lastAccountName)
            .then((account: Account) => {
                this.isLoading = false;
                this.statusLoading = true;

                this.account = account;
                this.hasNote = account && account.note && account.note !== '<p></p>';

                const getFollowStatusPromise = this.getFollowStatus(this.currentlyUsedAccount, this.account);
                const getStatusesPromise = this.getStatuses(this.currentlyUsedAccount, this.account);

                return Promise.all([getFollowStatusPromise, getStatusesPromise]);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isLoading = false;
                this.statusLoading = false;
            });
    }

    private getStatuses(userAccount: AccountInfo, account: Account): Promise<void> {
        this.statusLoading = true;
        return this.mastodonService.getAccountStatuses(userAccount, account.id, false, false, true, null, null, 40)
            .then((result: Status[]) => {
                for (const status of result) {
                    const wrapper = new StatusWrapper(status, userAccount);
                    this.statuses.push(wrapper);
                }
                this.statusLoading = false;
            });
    }

    private getFollowStatus(userAccount: AccountInfo, account: Account): Promise<void> {
        this.relationship = null;
        return this.mastodonService.getRelationships(userAccount, [account])
            .then((result: Relationship[]) => {
                this.relationship = result.filter(x => x.id === account.id)[0];
            });
    }

    refresh(): any {
        this.load(this.lastAccountName);
    }

    browseAccount(accountName: string): void {
        this.browseAccountEvent.next(accountName);
    }

    browseHashtag(hashtag: string): void {
        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.browseThreadEvent.next(openThreadEvent);
    }

    follow(): boolean {

        this.mastodonService.follow(this.currentlyUsedAccount, this.account)
            .then(() => {})
            .catch(() => {});
        return false;
    }

    unfollow(): boolean {
        this.mastodonService.unfollow(this.currentlyUsedAccount, this.account)
        .then(() => {})
        .catch(() => {});
        return false;
    }
}
