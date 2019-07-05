import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { faUser, faHourglassHalf, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { faUser as faUserRegular } from "@fortawesome/free-regular-svg-icons";
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { Account, Status, Relationship, Attachment } from "../../../services/models/mastodon.interfaces";
import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { NotificationService } from '../../../services/notification.service';
import { AccountInfo } from '../../../states/accounts.state';
import { StatusWrapper } from '../../../models/common.model';
import { EmojiConverter, EmojiTypeEnum } from '../../../tools/emoji.tools';
import { NavigationService } from '../../../services/navigation.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    private emojiConverter = new EmojiConverter();

    faUser = faUser;
    faUserRegular = faUserRegular;
    faHourglassHalf = faHourglassHalf;
    faUserCheck = faUserCheck;

    displayedAccount: Account;
    hasNote: boolean;

    note: string;

    isLoading: boolean;

    private maxReached = false;
    private maxId: string;
    statusLoading: boolean;
    error: string;

    relationship: Relationship;
    statuses: StatusWrapper[] = [];

    private lastAccountName: string;

    private currentlyUsedAccount: AccountInfo;
    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    @ViewChild('statusstream') public statustream: ElementRef;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input('currentAccount')
    set currentAccount(accountName: string) {
        this.load(accountName);
    }

    constructor(
        private readonly store: Store,
        private readonly navigationService: NavigationService,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService,
        private readonly toolsService: ToolsService) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            if (this.displayedAccount) {
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

        this.displayedAccount = null;
        this.isLoading = true;

        this.lastAccountName = accountName;
        this.currentlyUsedAccount = this.toolsService.getSelectedAccounts()[0];

        return this.toolsService.findAccount(this.currentlyUsedAccount, this.lastAccountName)
            .then((account: Account) => {
                this.isLoading = false;
                this.statusLoading = true;

                this.displayedAccount = account;
                this.hasNote = account && account.note && account.note !== '<p></p>';
                if (this.hasNote) {
                    this.note = this.emojiConverter.applyEmojis(account.emojis, account.note, EmojiTypeEnum.medium);
                }

                const getFollowStatusPromise = this.getFollowStatus(this.currentlyUsedAccount, this.displayedAccount);
                const getStatusesPromise = this.getStatuses(this.currentlyUsedAccount, this.displayedAccount);

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
            .then((statuses: Status[]) => {
                this.loadStatus(userAccount, statuses);

                // if (statuses.length === 0) {
                //     this.maxReached = true;
                //     return;
                // }

                // for (const status of statuses) {
                //     const wrapper = new StatusWrapper(status, userAccount);
                //     this.statuses.push(wrapper);
                // }

                // this.maxId = this.statuses[this.statuses.length - 1].status.id;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.statusLoading = false;
            });
    }

    private getFollowStatus(userAccount: AccountInfo, account: Account): Promise<void> {
        // this.relationship = null;
        return this.mastodonService.getRelationships(userAccount, [account])
            .then((result: Relationship[]) => {
                this.relationship = result.filter(x => x.id === account.id)[0];
            });
    }

    showAvatar(avatarUrl: string): boolean {
        const att: Attachment = {
            id: '',
            type: 'image',
            remote_url: avatarUrl,
            preview_url: avatarUrl,
            url: avatarUrl,
            meta: null,
            text_url: '',
            description: '',
            pleroma: null
        }
        this.navigationService.openMedia({
            selectedIndex: 0,
            attachments: [att],
            iframe: null
        });

        return false;
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
        const userAccount = this.toolsService.getSelectedAccounts()[0];
        this.toolsService.findAccount(userAccount, this.lastAccountName)
            .then((account: Account) => {
                return this.mastodonService.follow(userAccount, account);
            })
            .then((relationship: Relationship) => {
                this.relationship = relationship;
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            });
        return false;
    }

    unfollow(): boolean {
        const userAccount = this.toolsService.getSelectedAccounts()[0];
        this.toolsService.findAccount(userAccount, this.lastAccountName)
            .then((account: Account) => {
                return this.mastodonService.unfollow(userAccount, account);
            })
            .then((relationship: Relationship) => {
                this.relationship = relationship;
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            });
        return false;
    }

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;

        if (atBottom) {
            this.scrolledToBottom();
        }
    }

    private scrolledToBottom() {
        if (this.statusLoading || this.maxReached) return;

        this.statusLoading = true;
        const userAccount = this.currentlyUsedAccount;
        this.mastodonService.getAccountStatuses(userAccount, this.displayedAccount.id, false, false, true, this.maxId, null, 40)
            .then((statuses: Status[]) => {
                this.loadStatus(userAccount, statuses);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.statusLoading = false;
            });
    }

    private loadStatus(userAccount: AccountInfo, statuses: Status[]) {
        if (statuses.length === 0) {
            this.maxReached = true;
            return;
        }

        for (const status of statuses) {
            const wrapper = new StatusWrapper(status, userAccount);
            this.statuses.push(wrapper);
        }

        this.maxId = this.statuses[this.statuses.length - 1].status.id;
    }
}
