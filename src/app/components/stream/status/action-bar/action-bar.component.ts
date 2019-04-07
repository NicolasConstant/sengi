import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { faWindowClose, faReply, faRetweet, faStar } from "@fortawesome/free-solid-svg-icons";
import { faWindowClose as faWindowCloseRegular } from "@fortawesome/free-regular-svg-icons";

import { MastodonService } from '../../../../services/mastodon.service';
import { AccountInfo } from '../../../../states/accounts.state';
import { Status } from '../../../../services/models/mastodon.interfaces';
import { ToolsService } from '../../../../services/tools.service';
import { NotificationService } from '../../../../services/notification.service';
import { StatusWrapper } from '../../../../models/common.model';

@Component({
    selector: 'app-action-bar',
    templateUrl: './action-bar.component.html',
    styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit, OnDestroy {
    faWindowClose = faWindowClose;
    faReply = faReply;
    faRetweet = faRetweet;
    faStar = faStar;
    faWindowCloseRegular = faWindowCloseRegular;

    @Input() statusWrapper: StatusWrapper;
    @Output() replyEvent = new EventEmitter();
    @Output() cwIsActiveEvent = new EventEmitter<boolean>();

    isFavorited: boolean;
    isBoosted: boolean;

    isBoostLocked: boolean;
    isLocked: boolean;

    favoriteIsLoading: boolean;
    boostIsLoading: boolean;

    isContentWarningActive: boolean = false;

    private isProviderSelected: boolean;
    private selectedAccounts: AccountInfo[];

    private favoriteStatePerAccountId: { [id: string]: boolean; } = {};
    private bootedStatePerAccountId: { [id: string]: boolean; } = {};

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService,
        private readonly notificationService: NotificationService) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        const status = this.statusWrapper.status;
        const account = this.statusWrapper.provider;
        this.favoriteStatePerAccountId[account.id] = status.favourited;
        this.bootedStatePerAccountId[account.id] = status.reblogged;

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.checkStatus(accounts);
        });
    }

    ngOnDestroy(): void {
        this.accountSub.unsubscribe();
    }

    private checkStatus(accounts: AccountInfo[]): void {
        const status = this.statusWrapper.status;
        const provider = this.statusWrapper.provider;
        this.selectedAccounts = accounts.filter(x => x.isSelected);
        this.isProviderSelected = this.selectedAccounts.filter(x => x.id === provider.id).length > 0;

        if (status.visibility === 'direct' || status.visibility === 'private') {
            this.isBoostLocked = true;
        } else {
            this.isBoostLocked = false;
        }

        if ((status.visibility === 'direct' || status.visibility === 'private') && !this.isProviderSelected) {
            this.isLocked = true;
        } else {
            this.isLocked = false;
        }

        if (status.sensitive || status.spoiler_text) {
            this.isContentWarningActive = true;
        }

        this.checkIfFavorited();
        this.checkIfBoosted();
    }

    showContent(): boolean {
        this.isContentWarningActive = false;
        this.cwIsActiveEvent.next(false);
        return false;
    }

    hideContent(): boolean {
        this.isContentWarningActive = true;
        this.cwIsActiveEvent.next(true);
        return false;
    }

    reply(): boolean {
        this.replyEvent.emit();
        return false;
    }

    boost(): boolean {
        if(this.boostIsLoading) return;

        this.boostIsLoading = true;
        const account = this.toolsService.getSelectedAccounts()[0];
        const usableStatus = this.toolsService.getStatusUsableByAccount(account, this.statusWrapper);
        usableStatus
            .then((status: Status) => {
                if (this.isBoosted && status.reblogged) {
                    return this.mastodonService.unreblog(account, status);
                } else if (!this.isBoosted && !status.reblogged) {
                    return this.mastodonService.reblog(account, status);
                } else {
                    return Promise.resolve(status);
                }
            })
            .then((boostedStatus: Status) => {
                this.bootedStatePerAccountId[account.id] = boostedStatus.reblogged;
                this.checkIfBoosted();
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.boostIsLoading = false;
            });

        return false;
    }

    favorite(): boolean {
        if(this.favoriteIsLoading) return;

        this.favoriteIsLoading = true;
        const account = this.toolsService.getSelectedAccounts()[0];
        const usableStatus = this.toolsService.getStatusUsableByAccount(account, this.statusWrapper);
        usableStatus
            .then((status: Status) => {
                if (this.isFavorited && status.favourited) {
                    return this.mastodonService.unfavorite(account, status);
                } else if (!this.isFavorited && !status.favourited) {
                    return this.mastodonService.favorite(account, status);
                } else {
                    return Promise.resolve(status);
                }
            })
            .then((favoritedStatus: Status) => {
                this.favoriteStatePerAccountId[account.id] = favoritedStatus.favourited;
                this.checkIfFavorited();
                // this.isFavorited = !this.isFavorited;
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.favoriteIsLoading = false;
            });

        return false;
    }

    private checkIfBoosted() {
        const selectedAccount = <AccountInfo>this.selectedAccounts[0];
        if (selectedAccount) {
            this.isBoosted = this.bootedStatePerAccountId[selectedAccount.id];
        } else {
            this.isBoosted = false;
        }
    }

    private checkIfFavorited() {
        const selectedAccount = <AccountInfo>this.selectedAccounts[0];

        if (selectedAccount) {
            this.isFavorited = this.favoriteStatePerAccountId[selectedAccount.id];
        } else {
            this.isFavorited = false;
        }
    }

    more(): boolean {
        console.warn('more'); //TODO
        return false;
    }
}
