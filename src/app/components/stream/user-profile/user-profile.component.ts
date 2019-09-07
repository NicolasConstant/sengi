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
import { StatusWrapper, OpenMediaEvent } from '../../../models/common.model';
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
    loadingRelationShip = false;
    showFloatingHeader = false;
    showFloatingStatusMenu = false;

    private maxReached = false;
    private maxId: string;
    statusLoading: boolean;
    error: string;

    relationship: Relationship;
    statuses: StatusWrapper[] = [];
    pinnedStatuses: StatusWrapper[] = [];

    profileSection: 'fields' | 'choices' | 'hashtags' = 'fields';
    statusSection: 'status' | 'replies' | 'media' = 'status';

    private lastAccountName: string;

    private currentlyUsedAccount: AccountInfo;
    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;
    private deleteStatusSubscription: Subscription;
    private refreshSubscription: Subscription;
    private goToTopSubscription: Subscription;

    @ViewChild('statusstream') public statustream: ElementRef;
    @ViewChild('profilestatuses') public profilestatuses: ElementRef;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input() refreshEventEmitter: EventEmitter<any>;
    @Input() goToTopEventEmitter: EventEmitter<any>;

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
        if (this.refreshEventEmitter) {
            this.refreshSubscription = this.refreshEventEmitter.subscribe(() => {
                this.refresh();
            })
        }

        if (this.goToTopEventEmitter) {
            this.goToTopSubscription = this.goToTopEventEmitter.subscribe(() => {
                this.goToTop();
            })
        }

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            if (this.displayedAccount) {
                const userAccount = accounts.filter(x => x.isSelected)[0];

                this.loadingRelationShip = true;
                this.toolsService.findAccount(userAccount, this.lastAccountName)
                    .then((account: Account) => {
                        return this.getFollowStatus(userAccount, account);
                    })
                    .catch((err: HttpErrorResponse) => {
                        this.notificationService.notifyHttpError(err, userAccount);
                    })
                    .then(() => {
                        this.loadingRelationShip = false;
                    });
            }
        });

        this.deleteStatusSubscription = this.notificationService.deletedStatusStream.subscribe((status: StatusWrapper) => {
            if (status) {
                this.statuses = this.statuses.filter(x => {
                    return !(x.status.url.replace('https://', '').split('/')[0] === status.provider.instance && x.status.id === status.status.id);
                });
            }
        });
    }   

    ngOnDestroy() {
        if (this.accountSub) this.accountSub.unsubscribe();
        if (this.deleteStatusSubscription) this.deleteStatusSubscription.unsubscribe();
        if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
    }

    goToTop(): any {
        const stream = this.statustream.nativeElement as HTMLElement;
        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);
    }

    private load(accountName: string) {
        this.statuses.length = 0;
        this.pinnedStatuses.length = 0;

        this.displayedAccount = null;
        this.isLoading = true;
        this.showFloatingHeader = false;
        this.isSwitchingSection = false;

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
                const getStatusesPromise = this.getStatuses(this.currentlyUsedAccount, this.displayedAccount, false, true, null);
                const getPinnedStatusesPromise = this.getPinnedStatuses(this.currentlyUsedAccount, this.displayedAccount);

                return Promise.all([getFollowStatusPromise, getStatusesPromise, getPinnedStatusesPromise]);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, this.currentlyUsedAccount);
            })
            .then(() => {
                this.isLoading = false;
                this.statusLoading = false;
            });
    }

    private getPinnedStatuses(userAccount: AccountInfo, account: Account): Promise<void> {
        return this.mastodonService.getAccountStatuses(userAccount, account.id, false, true, false, null, null, 20)
            .then((statuses: Status[]) => {
                for (const status of statuses) {
                    status.pinned = true;
                    const wrapper = new StatusWrapper(status, userAccount);
                    this.pinnedStatuses.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, userAccount);
            });
    }

    private getStatuses(userAccount: AccountInfo, account: Account, onlyMedia: boolean, excludeReplies: boolean, maxId: string): Promise<void> {
        this.statusLoading = true;

        return this.mastodonService.getAccountStatuses(userAccount, account.id, onlyMedia, false, excludeReplies, maxId, null, 40)
            .then((statuses: Status[]) => {
                this.loadStatus(userAccount, statuses);
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, userAccount);
            })
            .then(() => {
                this.statusLoading = false;
            });
    }

    private getFollowStatus(userAccount: AccountInfo, account: Account): Promise<void> {
        this.loadingRelationShip = true;
        return this.mastodonService.getRelationships(userAccount, [account])
            .then((result: Relationship[]) => {
                this.relationship = result.filter(x => x.id === account.id)[0];
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, userAccount);
            })
            .then(() => {
                this.loadingRelationShip = false;
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
        this.showFloatingHeader = false;
        this.load(this.lastAccountName);
    }

    browseAccount(accountName: string): void {
        if(accountName === this.toolsService.getAccountFullHandle(this.displayedAccount)) return;

        this.browseAccountEvent.next(accountName);
    }

    openMigratedAccount(account: Account): boolean {
        const handle = this.toolsService.getAccountFullHandle(account);
        this.browseAccount(handle);
        return false;
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
                this.notificationService.notifyHttpError(err, userAccount);
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
                this.notificationService.notifyHttpError(err, userAccount);
            });
        return false;
    }

    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;

        if (element.scrollTop > 135) {
            this.showFloatingHeader = true;
        } else {
            this.showFloatingHeader = false;
        }

        const menuPosition = element.scrollHeight - this.profilestatuses.nativeElement.offsetHeight - 30 - 31;
        if (element.scrollTop > menuPosition) {
            this.showFloatingStatusMenu = true;
        } else {
            this.showFloatingStatusMenu = false;
        }

        if (atBottom) {
            this.scrolledToBottom();
        }
    }

    private scrolledToBottom() {
        if (this.statusLoading || this.maxReached) return;

        const onlyMedia = this.statusSection === 'media';
        const excludeReplies = this.statusSection === 'status';

        this.getStatuses(this.currentlyUsedAccount, this.displayedAccount, onlyMedia, excludeReplies, this.maxId);
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

    openAccount(): boolean {
        window.open(this.displayedAccount.url, '_blank');
        return false;
    }

    switchProfileSection(section: 'fields' | 'choices' | 'hashtags'): boolean {
        this.profileSection = section;
        return false;
    }

    isSwitchingSection: boolean;
    switchStatusSection(section: 'status' | 'replies' | 'media'): boolean {
        this.isSwitchingSection = true;

        this.statusSection = section;
        this.statuses.length = 0;
        this.maxId = null;

        // this.showFloatingHeader = false;
        // this.showFloatingStatusMenu = false;

        let promise: Promise<any>;
        switch (section) {
            case "status":
                promise = this.getStatuses(this.currentlyUsedAccount, this.displayedAccount, false, true, this.maxId);
                break;
            case "replies":
                promise = this.getStatuses(this.currentlyUsedAccount, this.displayedAccount, false, false, this.maxId);
                break;
            case "media":
                promise = this.getStatuses(this.currentlyUsedAccount, this.displayedAccount, true, true, this.maxId);
                break;
        }
        if (promise) {
            promise
                .catch(err => {
                })
                .then(() => {
                    this.isSwitchingSection = false;
                });
        } else {
            this.isSwitchingSection = false;
        }

        if (this.showFloatingStatusMenu) {
            setTimeout(() => {
                var element = this.statustream.nativeElement as HTMLElement;
                const menuPosition = element.scrollHeight - this.profilestatuses.nativeElement.offsetHeight - 30 - 29;
                element.scrollTop = menuPosition;
            }, 0);
        }

        return false;
    }

    openAttachment(attachment: Attachment): boolean {
        let openMediaEvent = new OpenMediaEvent(0, [attachment], null);
        this.navigationService.openMedia(openMediaEvent);
        return false;
    }
}
