import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { faWindowClose, faReply, faRetweet, faStar, faEllipsisH, faLock, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWindowClose as faWindowCloseRegular } from "@fortawesome/free-regular-svg-icons";
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';

import { MastodonService } from '../../../../services/mastodon.service';
import { AccountInfo } from '../../../../states/accounts.state';
import { Status, Account, Results } from '../../../../services/models/mastodon.interfaces';
import { ToolsService, OpenThreadEvent } from '../../../../services/tools.service';
import { NotificationService } from '../../../../services/notification.service';
import { StatusWrapper } from '../../../../models/common.model';
import { NavigationService } from '../../../../services/navigation.service';

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

    @ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;
    public items = [
        { name: 'John', otherProperty: 'Foo' },
        { name: 'Joe', otherProperty: 'Bar' }
    ];

    @Input() statusWrapper: StatusWrapper;
    @Output() replyEvent = new EventEmitter();
    @Output() cwIsActiveEvent = new EventEmitter<boolean>();

    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    isFavorited: boolean;
    isBoosted: boolean;
    isDM: boolean;

    isBoostLocked: boolean;
    isLocked: boolean;

    favoriteIsLoading: boolean;
    boostIsLoading: boolean;

    isContentWarningActive: boolean = false;

    isOwnerSelected: boolean;

    private isProviderSelected: boolean;
    private selectedAccounts: AccountInfo[];

    username: string;
    displayedStatus: Status;
    private fullHandle: string;
    private loadedAccounts: AccountInfo[];

    private favoriteStatePerAccountId: { [id: string]: boolean; } = {};
    private bootedStatePerAccountId: { [id: string]: boolean; } = {};

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly navigationService: NavigationService,
        private readonly contextMenuService: ContextMenuService,
        private readonly store: Store,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService,
        private readonly notificationService: NotificationService) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        const status = this.statusWrapper.status;
        const account = this.statusWrapper.provider;

        if (status.reblog) {
            this.favoriteStatePerAccountId[account.id] = status.reblog.favourited;
            this.bootedStatePerAccountId[account.id] = status.reblog.reblogged;
            this.extractHandle(status.reblog.account);
            this.displayedStatus = status.reblog;
        } else {
            this.favoriteStatePerAccountId[account.id] = status.favourited;
            this.bootedStatePerAccountId[account.id] = status.reblogged;
            this.extractHandle(status.account);
            this.displayedStatus = status;
        }

        if (this.displayedStatus.visibility === 'direct') {
            this.isDM = true;
        }

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.loadedAccounts = accounts;
            this.checkStatus(accounts);
        });
    }

    private extractHandle(account: Account) {
        this.username = account.acct.split('@')[0];
        this.fullHandle = account.acct.toLowerCase();
        if (!this.fullHandle.includes('@')) {
            this.fullHandle += `@${account.url.replace('https://', '').split('/')[0]}`;
        }
        this.fullHandle = `@${this.fullHandle}`;
    }

    ngOnDestroy(): void {
        this.accountSub.unsubscribe();
    }

    private checkStatus(accounts: AccountInfo[]): void {
        const status = this.statusWrapper.status;
        const provider = this.statusWrapper.provider;
        this.selectedAccounts = accounts.filter(x => x.isSelected);
        this.isProviderSelected = this.selectedAccounts.filter(x => x.id === provider.id).length > 0;

        this.isOwnerSelected = this.selectedAccounts[0].username === this.displayedStatus.account.username
            && this.selectedAccounts[0].instance === this.displayedStatus.account.url.replace('https://', '').split('/')[0];

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
        if (this.boostIsLoading) return;

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
                if (boostedStatus.pleroma) {
                    this.bootedStatePerAccountId[account.id] = boostedStatus.reblog !== null; //FIXME: when Pleroma will return the good status
                } else {
                    this.bootedStatePerAccountId[account.id] = boostedStatus.reblogged;
                }

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
        if (this.favoriteIsLoading) return;

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

    public onContextMenu($event: MouseEvent): void {
        this.contextMenuService.show.next({
            // Optional - if unspecified, all context menu components will open
            contextMenu: this.contextMenu,
            event: $event,
            item: null
        });
        $event.preventDefault();
        $event.stopPropagation();
    }

    expandStatus(): boolean {
        const openThread = new OpenThreadEvent(this.displayedStatus, this.statusWrapper.provider);
        this.browseThreadEvent.next(openThread);
        return false;
    }

    copyStatusLink(): boolean {
        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = this.displayedStatus.url;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);

        return false;
    }

    mentionAccount(): boolean {
        this.navigationService.replyToUser(this.fullHandle, false);
        return false;
    }

    dmAccount(): boolean {
        this.navigationService.replyToUser(this.fullHandle, true);
        return false;
    }

    muteAccount(): boolean {
        this.loadedAccounts.forEach(acc => {
            this.toolsService.findAccount(acc, this.fullHandle)
                .then((target: Account) => {
                    this.mastodonService.mute(acc, target.id);
                    return target;
                })
                .then((target: Account) => {
                    this.notificationService.hideAccount(target);
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err);
                });
        });

        return false;
    }

    blockAccount(): boolean {
        this.loadedAccounts.forEach(acc => {
            this.toolsService.findAccount(acc, this.fullHandle)
                .then((target: Account) => {
                    this.mastodonService.block(acc, target.id);
                    return target;
                })
                .then((target: Account) => {
                    this.notificationService.hideAccount(target);
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err);
                });
        });

        return false;
    }

    muteConversation(): boolean {
        const selectedAccount = this.selectedAccounts[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                return this.mastodonService.muteConversation(selectedAccount, status.id)
            })
            .then((status: Status) => {
                this.displayedStatus.muted = status.muted;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });

        return false;
    }

    unmuteConversation(): boolean {
        const selectedAccount = this.selectedAccounts[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                return this.mastodonService.unmuteConversation(selectedAccount, status.id)
            })
            .then((status: Status) => {
                this.displayedStatus.muted = status.muted;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });

        return false;
    }

    pinOnProfile(): boolean {
        const selectedAccount = this.selectedAccounts[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                return this.mastodonService.pinOnProfile(selectedAccount, status.id)
            })
            .then((status: Status) => {
                this.displayedStatus.pinned = status.pinned;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });

        return false;
    }

    unpinFromProfile(): boolean {
        const selectedAccount = this.selectedAccounts[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                return this.mastodonService.unpinFromProfile(selectedAccount, status.id)
            })
            .then((status: Status) => {
                this.displayedStatus.pinned = status.pinned;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });

        return false;
    }

    delete(redraft: boolean): boolean {
        const selectedAccount = this.selectedAccounts[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                return this.mastodonService.deleteStatus(selectedAccount, status.id);
            })
            .then(() => {
                const deletedStatus = new StatusWrapper(this.displayedStatus, selectedAccount);
                this.notificationService.deleteStatus(deletedStatus);

                if (redraft) {
                    //TODO
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });

        return false;
    }

    private getStatus(account: AccountInfo): Promise<Status> {
        let statusPromise: Promise<Status> = Promise.resolve(this.statusWrapper.status);

        if (account.id !== this.statusWrapper.provider.id) {
            statusPromise = this.mastodonService.search(account, this.statusWrapper.status.url, true)
                .then((result: Results) => {
                    return result.statuses[0];
                });
        }

        return statusPromise;
    }
}
