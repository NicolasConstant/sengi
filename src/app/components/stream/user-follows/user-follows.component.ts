import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';
import { ToolsService } from '../../../services/tools.service';
import { Account } from "../../../services/models/mastodon.interfaces";
import { NotificationService } from '../../../services/notification.service';
import { FollowingResult } from '../../../services/mastodon.service';

@Component({
    selector: 'app-user-follows',
    templateUrl: './user-follows.component.html',
    styleUrls: ['./user-follows.component.scss']
})
export class UserFollowsComponent implements OnInit, OnDestroy {

    private _type: 'follows' | 'followers';
    private _currentAccount: string;

    private maxId: string;
    isLoading: boolean = true;
    accounts: Account[] = [];    

    @Input('type')
    set setType(type: 'follows' | 'followers') {
        this._type = type;
        this.load(this._type, this._currentAccount);
    }
    get setType(): 'follows' | 'followers' {
        return this._type;
    }

    @Input('currentAccount')
    set currentAccount(accountName: string) {
        this._currentAccount = accountName;
        this.load(this._type, this._currentAccount);
    }
    get currentAccount(): string {
        return this._currentAccount;
    }

    @Input() refreshEventEmitter: EventEmitter<any>;
    @Input() goToTopEventEmitter: EventEmitter<any>;

    @Output() browseAccountEvent = new EventEmitter<string>();

    @ViewChild('accountslist') public accountslist: ElementRef;

    private refreshSubscription: Subscription;
    private goToTopSubscription: Subscription;
    // private accountSub: Subscription;    
    // private accounts$: Observable<AccountInfo[]>;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonWrapperService) {
        // this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
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
    }

    ngOnDestroy(): void {
        if (this.refreshSubscription) this.refreshSubscription.unsubscribe();
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
        // if (this.accountSub) this.accountSub.unsubscribe();
    }

    private load(type: 'follows' | 'followers', accountName: string) {
        if (type && accountName) {
            this.accounts = [];
            this.isLoading = true;

            let currentAccount = this.toolsService.getSelectedAccounts()[0];
            this.toolsService.findAccount(currentAccount, accountName)
                .then((acc: Account) => {
                    if (type === 'followers') {
                        return this.mastodonService.getFollowers(currentAccount, acc.id, null, null);
                    } else if (type === 'follows') {
                        return this.mastodonService.getFollowing(currentAccount, acc.id, null, null);
                    } else {
                        throw Error('not implemented');
                    }
                })
                .then((result: FollowingResult) => {
                    this.maxId = result.maxId;
                    this.accounts = result.follows;
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err, currentAccount);
                })
                .then(() => {
                    this.isLoading = false;
                });
        }
    }

    private scrolledToBottom() {
        if (this.isLoading || this.maxReached || this.scrolledErrorOccured || this.accounts.length === 0) return;

        this.isLoading = true;
        this.isProcessingInfiniteScroll = true;

        let currentAccount = this.toolsService.getSelectedAccounts()[0];
        this.toolsService.findAccount(currentAccount, this._currentAccount)
            .then((acc: Account) => {
                if (this._type === 'followers') {
                    return this.mastodonService.getFollowers(currentAccount, acc.id, this.maxId, null);
                } else if (this._type === 'follows') {
                    return this.mastodonService.getFollowing(currentAccount, acc.id, this.maxId, null);
                } else {
                    throw Error('not implemented');
                }
            })
            .then((result: FollowingResult) => {
                if(!result) return;

                let accounts = result.follows;

                if (!accounts || accounts.length === 0 || this.maxReached) {
                    this.maxReached = true;
                    return;
                }
                
                for (let a of accounts) {
                    this.accounts.push(a);
                }

                this.maxId = result.maxId;
                if(!this.maxId) {
                    this.maxReached = true;
                }
            })
            .catch((err: HttpErrorResponse) => {
                this.scrolledErrorOccured = true;
                setTimeout(() => {
                    this.scrolledErrorOccured = false;
                }, 5000);

                this.notificationService.notifyHttpError(err, currentAccount);
            })
            .then(() => {
                this.isLoading = false;
                this.isProcessingInfiniteScroll = false;
            });
    }

    refresh(): any {        
        this.load(this._type, this._currentAccount);
    }

    goToTop(): any {
        const stream = this.accountslist.nativeElement as HTMLElement;
        setTimeout(() => {
            stream.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 0);
    }

    browseAccount(account: Account) {
        let acc = this.toolsService.getAccountFullHandle(account);
        this.browseAccountEvent.next(acc);
    }

    onScroll() {
        var element = this.accountslist.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;
        const atTop = element.scrollTop === 0;

        if (atBottom) {
            this.scrolledToBottom();
        }
    }

    private scrolledErrorOccured = false;
    private maxReached = false;
    private isProcessingInfiniteScroll = false;

}
