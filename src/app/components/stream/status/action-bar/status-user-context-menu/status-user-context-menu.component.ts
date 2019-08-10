import { Component, OnInit, ViewChild, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { Status, Account, Results } from '../../../../../services/models/mastodon.interfaces';
import { ToolsService, OpenThreadEvent } from '../../../../../services/tools.service';
import { StatusWrapper } from '../../../../../models/common.model';
import { NavigationService } from '../../../../../services/navigation.service';
import { AccountInfo } from '../../../../../states/accounts.state';
import { MastodonService } from '../../../../../services/mastodon.service';
import { NotificationService } from '../../../../../services/notification.service';


@Component({
    selector: 'app-status-user-context-menu',
    templateUrl: './status-user-context-menu.component.html',
    styleUrls: ['./status-user-context-menu.component.scss']
})
export class StatusUserContextMenuComponent implements OnInit, OnDestroy {
    faEllipsisH = faEllipsisH;

    private fullHandle: string;
    private loadedAccounts: AccountInfo[];
    displayedStatus: Status;
    username: string;
    isOwnerSelected: boolean;

    @Input() statusWrapper: StatusWrapper;
    @Input() displayedAccount: Account;

    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonService,
        private readonly notificationService: NotificationService,
        private readonly navigationService: NavigationService,
        private readonly toolsService: ToolsService,
        private readonly contextMenuService: ContextMenuService) {
        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {       
        if (this.statusWrapper) {

            const status = this.statusWrapper.status;
            if (status.reblog) {
                this.displayedStatus = status.reblog;
            } else {
                this.displayedStatus = status;
            }

            this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
                this.loadedAccounts = accounts;
                this.checkStatus(accounts);
            });
        }

        let account: Account;
        if(this.statusWrapper) {
            account = this.displayedStatus.account;
        } else {
            account = this.displayedAccount;
        }

        this.username = account.acct.split('@')[0];
        this.fullHandle = this.toolsService.getAccountFullHandle(account);
    }

    private checkStatus(accounts: AccountInfo[]): void {
        const selectedAccount = accounts.find(x => x.isSelected);

        this.isOwnerSelected = selectedAccount.username === this.displayedStatus.account.username
            && selectedAccount.instance === this.displayedStatus.account.url.replace('https://', '').split('/')[0];
    }


    ngOnDestroy(): void {
        if(this.accountSub) this.accountSub.unsubscribe();
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
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];

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
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];

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
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                console.warn(status);
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
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];

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
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                return this.mastodonService.deleteStatus(selectedAccount, status.id);
            })
            .then(() => {
                if (redraft) {
                    this.navigationService.redraft(this.statusWrapper)
                }

                const deletedStatus = new StatusWrapper(this.displayedStatus, selectedAccount);
                this.notificationService.deleteStatus(deletedStatus);
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
