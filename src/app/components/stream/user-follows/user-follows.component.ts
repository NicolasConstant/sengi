import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../../../states/accounts.state';
import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';
import { ToolsService } from '../../../services/tools.service';
import { Account } from "../../../services/models/mastodon.interfaces";



@Component({
    selector: 'app-user-follows',
    templateUrl: './user-follows.component.html',
    styleUrls: ['./user-follows.component.scss']
})
export class UserFollowsComponent implements OnInit, OnDestroy {

    private _type: 'follows' | 'followers';
    private _currentAccount: string;

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
        private readonly store: Store,
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
            console.warn(`type: ${type} account ${accountName}`);
            this.isLoading = true;

            let currentAccount = this.toolsService.getSelectedAccounts()[0];
            this.toolsService.findAccount(currentAccount, accountName)
                .then((acc: Account) => {
                    if(type === 'followers'){
                        return this.mastodonService.getFollowers(currentAccount, acc.id, null, null);
                    } else if(type === 'follows') {
                        return this.mastodonService.getFollowing(currentAccount, acc.id, null, null);
                    } else {
                        throw Error('not implemented');
                    }                    
                })
                .then((accounts: Account[]) => {
                    this.accounts = accounts;
                })
                .catch(err => {

                })
                .then(() => {
                    this.isLoading = false;
                });
        }
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
}
