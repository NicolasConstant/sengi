import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { faWindowClose, faReply, faRetweet, faStar, faEllipsisH, faLock, faEnvelope, faBookmark } from "@fortawesome/free-solid-svg-icons";
import { faWindowClose as faWindowCloseRegular } from "@fortawesome/free-regular-svg-icons";

import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { AccountInfo } from '../../../../states/accounts.state';
import { Status, Account, Results } from '../../../../services/models/mastodon.interfaces';
import { ToolsService, OpenThreadEvent, InstanceInfo } from '../../../../services/tools.service';
import { NotificationService } from '../../../../services/notification.service';
import { StatusWrapper } from '../../../../models/common.model';
import { StatusesStateService, StatusState } from '../../../../services/statuses-state.service';

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
    faEllipsisH = faEllipsisH;
    faLock = faLock;
    faEnvelope = faEnvelope;
    faBookmark = faBookmark;

    @Input() statusWrapper: StatusWrapper;
    @Output() replyEvent = new EventEmitter();
    @Output() cwIsActiveEvent = new EventEmitter<boolean>();

    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    isBookmarked: boolean;
    isFavorited: boolean;
    isBoosted: boolean;
    isDM: boolean;

    isBoostLocked: boolean;
    isLocked: boolean;
    isBookmarksAvailable: boolean;

    bookmarkingIsLoading: boolean;
    favoriteIsLoading: boolean;
    boostIsLoading: boolean;

    isContentWarningActive: boolean = false;

    displayedStatus: Status;

    private isProviderSelected: boolean;
    private selectedAccounts: AccountInfo[];

    private favoriteStatePerAccountId: { [id: string]: boolean; } = {};
    private bootedStatePerAccountId: { [id: string]: boolean; } = {};
    private bookmarkStatePerAccountId: { [id: string]: boolean; } = {};

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;
    private statusStateSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService,
        private readonly statusStateService: StatusesStateService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly notificationService: NotificationService) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        this.displayedStatus = this.statusWrapper.status;
        const account = this.statusWrapper.provider;
        let accountId = 'remote';
        if (account) {
            accountId = account.id;
        }

        if (this.displayedStatus.reblog) {
            this.displayedStatus = this.displayedStatus.reblog;
        }

        this.favoriteStatePerAccountId[accountId] = this.displayedStatus.favourited;
        this.bootedStatePerAccountId[accountId] = this.displayedStatus.reblogged;
        this.bookmarkStatePerAccountId[accountId] = this.displayedStatus.bookmarked;

        this.analyseMemoryStatus();

        if (this.displayedStatus.visibility === 'direct') {
            this.isDM = true;
        }

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.checkStatus(accounts);
        });

        this.statusStateSub = this.statusStateService.stateNotification.subscribe((state: StatusState) => {
            if (state && state.statusId === this.displayedStatus.url) {

                if (state.isFavorited !== null) {
                    this.favoriteStatePerAccountId[state.accountId] = state.isFavorited;
                }
                if (state.isRebloged !== null) {
                    this.bootedStatePerAccountId[state.accountId] = state.isRebloged;
                }
                if (state.isBookmarked !== null) {
                    this.bookmarkStatePerAccountId[state.accountId] = state.isBookmarked;
                }

                this.checkIfFavorited();
                this.checkIfBoosted();
                this.checkIfBookmarked();
            }
        });
    }

    ngOnDestroy(): void {
        this.accountSub.unsubscribe();
        this.statusStateSub.unsubscribe();
    }

    private analyseMemoryStatus() {
        let memoryStatusState = this.statusStateService.getStateForStatus(this.displayedStatus.url);
        if (!memoryStatusState) return;

        memoryStatusState.forEach((state: StatusState) => {
            this.favoriteStatePerAccountId[state.accountId] = state.isFavorited;
            this.bootedStatePerAccountId[state.accountId] = state.isRebloged;
            this.bookmarkStatePerAccountId[state.accountId] = state.isBookmarked;
        });
    }

    private checkStatus(accounts: AccountInfo[]): void {
        const status = this.statusWrapper.status;
        const provider = this.statusWrapper.provider;
        this.selectedAccounts = accounts.filter(x => x.isSelected);

        if (!this.statusWrapper.isRemote) {
            this.isProviderSelected = this.selectedAccounts.filter(x => x.id === provider.id).length > 0;
        } else {
            this.isProviderSelected = false;
        }

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

        this.isContentWarningActive = this.statusWrapper.applyCw;

        this.checkIfBookmarksAreAvailable(this.selectedAccounts[0]);
        this.checkIfFavorited();
        this.checkIfBoosted();
        this.checkIfBookmarked();
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

    private boostPromise: Promise<any>;
    boost(): boolean {
        if (!this.boostPromise) {
            this.boostPromise = Promise.resolve(true);
        }

        const account = this.toolsService.getSelectedAccounts()[0];
        this.boostPromise = this.boostPromise
            .then(() => {
                this.boostIsLoading = true;
                return this.toolsService.getStatusUsableByAccount(account, this.statusWrapper);
            })
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
                if (boostedStatus.pleroma) {
                    this.bootedStatePerAccountId[account.id] = boostedStatus.reblog !== null; //FIXME: when Pleroma will return the good status
                } else {
                    let reblogged = boostedStatus.reblogged; //FIXME: when pixelfed will return the good status
                    if (reblogged === null) {
                        reblogged = !this.bootedStatePerAccountId[account.id];
                    }
                    this.bootedStatePerAccountId[account.id] = reblogged;
                }

                this.checkIfBoosted();
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, account);
            })
            .then(() => {
                this.statusStateService.statusReblogStatusChanged(this.displayedStatus.url, account.id, this.bootedStatePerAccountId[account.id]);
                this.boostIsLoading = false;
                this.boostPromise = null;
            });

        return false;
    }

    private favoritePromise: Promise<any>;
    favorite(): boolean {
        if (!this.favoritePromise) {
            this.favoritePromise = Promise.resolve(true);
        }

        const account = this.toolsService.getSelectedAccounts()[0];
        this.favoritePromise = this.favoritePromise
            .then(() => {
                this.favoriteIsLoading = true;
                return this.toolsService.getStatusUsableByAccount(account, this.statusWrapper);
            })
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
                let favourited = favoritedStatus.favourited; //FIXME: when pixelfed will return the good status
                if (favourited === null) {
                    favourited = !this.favoriteStatePerAccountId[account.id];
                }
                this.favoriteStatePerAccountId[account.id] = favourited;
                this.checkIfFavorited();
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, account);
            })
            .then(() => {
                this.statusStateService.statusFavoriteStatusChanged(this.displayedStatus.url, account.id, this.favoriteStatePerAccountId[account.id]);
                this.favoriteIsLoading = false;
                this.favoritePromise = null;
            });

        return false;
    }

    private bookmarkPromise: Promise<any>;
    bookmark(): boolean {
        if (!this.bookmarkPromise) {
            this.bookmarkPromise = Promise.resolve(true);
        }

        const account = this.toolsService.getSelectedAccounts()[0];
        this.bookmarkPromise = this.bookmarkPromise
            .then(() => {
                this.bookmarkingIsLoading = true;
                return this.toolsService.getStatusUsableByAccount(account, this.statusWrapper);
            })
            .then((status: Status) => {
                if (this.isBookmarked && status.bookmarked) {
                    return this.mastodonService.unbookmark(account, status);
                } else if (!this.isBookmarked && !status.bookmarked) {
                    return this.mastodonService.bookmark(account, status);
                } else {
                    return Promise.resolve(status);
                }
            })
            .then((bookmarkedStatus: Status) => {
                let bookmarked = bookmarkedStatus.bookmarked; //FIXME: when pixelfed will return the good status
                if (bookmarked === null) {
                    bookmarked = !this.bookmarkStatePerAccountId[account.id];
                }
                this.bookmarkStatePerAccountId[account.id] = bookmarked;
                this.checkIfBookmarked();
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, account);
            })
            .then(() => {
                this.statusStateService.statusBookmarkStatusChanged(this.displayedStatus.url, account.id, this.bookmarkStatePerAccountId[account.id]);
                this.bookmarkingIsLoading = false;
                this.bookmarkPromise = null;
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

    private checkIfBookmarked() {
        const selectedAccount = <AccountInfo>this.selectedAccounts[0];

        if (selectedAccount) {
            this.isBookmarked = this.bookmarkStatePerAccountId[selectedAccount.id];
        } else {
            this.isBookmarked = false;
        }
    }

    private checkIfBookmarksAreAvailable(account: AccountInfo) {
        this.toolsService.isBookmarksAreAvailable(account)
            .then((isAvailable: boolean) => {
                this.isBookmarksAvailable = isAvailable;
            })
            .catch(err => {
                this.isBookmarksAvailable = false;
            });
    }

    browseThread(event: OpenThreadEvent) {
        this.browseThreadEvent.next(event);
    }
}
