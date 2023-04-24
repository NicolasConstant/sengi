import { Component, OnInit, ViewChild, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { Status, Account, Results, Relationship } from '../../../../../services/models/mastodon.interfaces';
import { ToolsService, OpenThreadEvent, InstanceInfo } from '../../../../../services/tools.service';
import { StatusWrapper } from '../../../../../models/common.model';
import { NavigationService } from '../../../../../services/navigation.service';
import { AccountInfo } from '../../../../../states/accounts.state';
import { MastodonWrapperService } from '../../../../../services/mastodon-wrapper.service';
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

    isEditingAvailable: boolean;

    @Input() statusWrapper: StatusWrapper;
    @Input() displayedAccount: Account;
    @Input() relationship: Relationship;

    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();
    @Output() relationshipChanged = new EventEmitter<Relationship>();

    @ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonWrapperService,
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
        }

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.loadedAccounts = accounts;
            if (this.statusWrapper) this.checkStatus(accounts);
        });

        let account: Account;
        if (this.statusWrapper) {
            account = this.displayedStatus.account;
        } else {
            account = this.displayedAccount;
        }

        this.username = account.acct.split('@')[0];
        this.fullHandle = this.toolsService.getAccountFullHandle(account);
    }

    private checkStatus(accounts: AccountInfo[]): void {
        const selectedAccount = accounts.find(x => x.isSelected);

        this.isOwnerSelected = selectedAccount.username.toLowerCase() === this.displayedStatus.account.username.toLowerCase()
            && selectedAccount.instance.toLowerCase() === this.displayedStatus.account.url.replace('https://', '').split('/')[0].toLowerCase();

        this.toolsService.getInstanceInfo(selectedAccount).then((instanceInfo: InstanceInfo) => {
            if (instanceInfo.major >= 4) {
                this.isEditingAvailable = true;
            } else {
                this.isEditingAvailable = false;
            }
        });
    }


    ngOnDestroy(): void {
        if (this.accountSub) this.accountSub.unsubscribe();
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

    copyAllData(): boolean {
        const newLine = String.fromCharCode(13, 10);

        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = `${this.displayedStatus.url}${newLine}${newLine}${this.displayedStatus.content}${newLine}${newLine}`;

        let parser = new DOMParser();
        var dom = parser.parseFromString(this.displayedStatus.content, 'text/html')
        selBox.value += `${dom.body.textContent}${newLine}${newLine}`;

        for (const att of this.displayedStatus.media_attachments) {
            selBox.value += `${att.url}${newLine}${newLine}`;
        }

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
        const acc = this.toolsService.getSelectedAccounts()[0];

        this.toolsService.findAccount(acc, this.fullHandle)
            .then(async (target: Account) => {
                const relationship = await this.mastodonService.mute(acc, target.id);
                this.relationship = relationship;
                this.relationshipChanged.next(relationship);
                return target;
            })
            .then((target: Account) => {
                this.notificationService.hideAccount(target);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, acc);
            });

        return false;
    }

    unmuteAccount(): boolean {
        const acc = this.toolsService.getSelectedAccounts()[0];

        this.toolsService.findAccount(acc, this.fullHandle)
            .then(async (target: Account) => {
                const relationship = await this.mastodonService.unmute(acc, target.id);
                this.relationship = relationship;
                this.relationshipChanged.next(relationship);
                return target;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, acc);
            });

        return false;
    }

    blockAccount(): boolean {
        const acc = this.toolsService.getSelectedAccounts()[0];

        this.toolsService.findAccount(acc, this.fullHandle)
            .then(async (target: Account) => {
                const relationship = await this.mastodonService.block(acc, target.id);
                this.relationship = relationship;
                this.relationshipChanged.next(relationship);
                return target;
            })
            .then((target: Account) => {
                this.notificationService.hideAccount(target);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, acc);
            });

        return false;
    }

    unblockAccount(): boolean {
        const acc = this.toolsService.getSelectedAccounts()[0];

        this.toolsService.findAccount(acc, this.fullHandle)
            .then(async (target: Account) => {
                const relationship = await this.mastodonService.unblock(acc, target.id);
                this.relationship = relationship;
                this.relationshipChanged.next(relationship);
                return target;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, acc);
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
                this.notificationService.notifyHttpError(err, selectedAccount);
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
                this.notificationService.notifyHttpError(err, selectedAccount);
            });

        return false;
    }

    pinOnProfile(): boolean {
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];

        this.getStatus(selectedAccount)
            .then((status: Status) => {
                return this.mastodonService.pinOnProfile(selectedAccount, status.id)
            })
            .then((status: Status) => {
                this.displayedStatus.pinned = status.pinned;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, selectedAccount);
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
                this.notificationService.notifyHttpError(err, selectedAccount);
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

                let cwPolicy = this.toolsService.checkContentWarning(this.displayedStatus);
                const deletedStatus = new StatusWrapper(cwPolicy.status, selectedAccount, cwPolicy.applyCw, cwPolicy.hide);
                this.notificationService.deleteStatus(deletedStatus);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, selectedAccount);
            });

        return false;
    }

    edit(): boolean {
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];
        this.getStatus(selectedAccount)
            .then(() => {
                this.navigationService.edit(this.statusWrapper);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, selectedAccount);
            });
        return false;
    }

    private getStatus(account: AccountInfo): Promise<Status> {
        let statusPromise: Promise<Status> = Promise.resolve(this.statusWrapper.status);

        if (account.id !== this.statusWrapper.provider.id) {
            statusPromise =
                this.toolsService.getInstanceInfo(account)
                    .then(instance => {
                        let version: 'v1' | 'v2' = 'v1';
                        if (instance.major >= 3) version = 'v2';
                        return this.mastodonService.search(account, this.statusWrapper.status.url, version, true);
                    })
                    .then((result: Results) => {
                        return result.statuses[0];
                    });
        }

        return statusPromise;
    }
}
