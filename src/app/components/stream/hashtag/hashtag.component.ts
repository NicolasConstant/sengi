import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy } from '@angular/core';
import { Subject, Subscription, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { StreamElement, StreamTypeEnum, AddStream } from '../../../states/streams.state';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { StreamStatusesComponent } from '../stream-statuses/stream-statuses.component';
import { AccountInfo } from '../../../states/accounts.state';
import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.component.html',
    styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit, OnDestroy {
    @Input() refreshEventEmitter: EventEmitter<any>;
    @Input() goToTopEventEmitter: EventEmitter<any>;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    private _hashtagElement: StreamElement;
    @Input()
    set hashtagElement(hashtagElement: StreamElement){
        this._hashtagElement = hashtagElement;
        this.lastUsedAccount = this.toolsService.getSelectedAccounts()[0];
    }
    get hashtagElement(): StreamElement{
        return this._hashtagElement;
    }


    @ViewChild('appStreamStatuses') appStreamStatuses: StreamStatusesComponent;

    goToTopSubject: Subject<void> = new Subject<void>();

    private lastUsedAccount: AccountInfo;
    private refreshSubscription: Subscription;
    private goToTopSubscription: Subscription;
    isHashtagFollowingAvailable: boolean;
    isFollowingHashtag: boolean;

    private accounts$: Observable<AccountInfo[]>;

    private accountSub: Subscription;

    followingLoading: boolean;
    unfollowingLoading: boolean;

    columnAdded: boolean;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonWrapperService) {
            this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
        }


    ngOnInit() {
        if(this.refreshEventEmitter) {
            this.refreshSubscription = this.refreshEventEmitter.subscribe(() => {
                this.refresh();
            })
        }

        if(this.goToTopEventEmitter) {
            this.goToTopSubscription = this.goToTopEventEmitter.subscribe(() => {
                this.goToTop();
            })
        }
        this.lastUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.updateHashtagFollowStatus(this.lastUsedAccount);

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            const selectedAccounts = accounts.filter(x => x.isSelected);
            if (selectedAccounts.length > 0) {
                this.lastUsedAccount = selectedAccounts[0];
                this.updateHashtagFollowStatus(this.lastUsedAccount);
            }
        });
    }

    ngOnDestroy(): void {
        if(this.refreshSubscription) this.refreshSubscription.unsubscribe();
        if (this.goToTopSubscription) this.goToTopSubscription.unsubscribe();
        if (this.accountSub) this.accountSub.unsubscribe();
    }

    goToTop(): boolean {
        this.goToTopSubject.next();
        return false;
    }

    addColumn(event): boolean {
        event.stopPropagation();

        const hashtag = this.hashtagElement.tag;
        const newStream = new StreamElement(StreamTypeEnum.tag, `${hashtag}`, this.lastUsedAccount.id, hashtag, null, null, this.lastUsedAccount.instance);
        this.store.dispatch([new AddStream(newStream)]);

        this.columnAdded = true;

        return false;
    }

    refresh(): any {
        this.lastUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.updateHashtagFollowStatus(this.lastUsedAccount);
        if (this.isHashtagFollowingAvailable) {
            this.checkIfFollowingHashtag(this.lastUsedAccount);
        }
        this.appStreamStatuses.refresh();
    }

    browseAccount(account: string) {
        this.browseAccountEvent.next(account);
    }

    browseHashtag(hashtag: string) {
        if(this.hashtagElement.tag === hashtag) return false;

        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.browseThreadEvent.next(openThreadEvent);
    }

    private updateHashtagFollowStatus(account: AccountInfo): void {
        this.toolsService.getInstanceInfo(account).then(instanceInfo => {
            if (instanceInfo.major >= 4) {
                this.isHashtagFollowingAvailable = true;
                this.checkIfFollowingHashtag(account);
            } else {
                this.isHashtagFollowingAvailable = false;
            }
        });
    }

    private checkIfFollowingHashtag(account: AccountInfo): void {
        this.mastodonService.getHashtag(account, this.hashtagElement.tag).then(tag => {
            this.isFollowingHashtag = tag.following;
        });
    }

    followThisHashtag(event): boolean {
        this.followingLoading = true;
        event.stopPropagation();
        this.mastodonService.followHashtag(this.lastUsedAccount, this.hashtagElement.tag).then(tag => {
            this.isFollowingHashtag = tag.following;
            this.followingLoading = false;
        });
        return false
    }

    unfollowThisHashtag(event): boolean {
        this.unfollowingLoading = true;
        event.stopPropagation();
        this.mastodonService.unfollowHashtag(this.lastUsedAccount, this.hashtagElement.tag).then(tag => {
            this.isFollowingHashtag = tag.following;
            this.unfollowingLoading = false;
        });
        return false
    }
}
