import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { faAngleLeft, faAngleRight, faTimes, faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { StreamElement, StreamTypeEnum } from '../../../states/streams.state';
import { ThreadComponent } from '../thread/thread.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { HashtagComponent } from '../hashtag/hashtag.component';
import { AccountInfo } from '../../../states/accounts.state';


@Component({
    selector: 'app-stream-overlay',
    templateUrl: './stream-overlay.component.html',
    styleUrls: ['./stream-overlay.component.scss']
})
export class StreamOverlayComponent implements OnInit, OnDestroy {
    faAngleLeft = faAngleLeft;
    faAngleRight = faAngleRight;
    faTimes = faTimes;
    faRedoAlt = faRedoAlt;
   
    refreshFocused: boolean;
    previousElements: OverlayBrowsing[] = [];
    nextElements: OverlayBrowsing[] = [];
    private currentElement: OverlayBrowsing;

    // canRefresh: boolean = true;
    // canGoForward: boolean;

    accountName: string;
    thread: OpenThreadEvent;
    hashtagElement: StreamElement;

    @Output() closeOverlay = new EventEmitter();

    @Input('browseAccountData')
    set browseAccountData(accountName: string) {
        this.browseAccount(accountName);
    }

    @Input('browseThreadData')
    set browseThreadData(openThread: OpenThreadEvent) {
        this.browseThread(openThread);
    }

    @Input('browseHashtagData')
    set browseHashtagData(hashtag: string) {
        this.browseHashtag(hashtag);
    }

    @ViewChild('appUserProfile') appUserProfile: UserProfileComponent;
    @ViewChild('appHashtag') appHashtag: HashtagComponent;
    @ViewChild('appThread') appThread: ThreadComponent;

    private currentlyUsedAccount: AccountInfo;
    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService) { 
        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        this.currentlyUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.checkAccountChanges(accounts);
        });
    }

    checkAccountChanges(accounts: AccountInfo[]): any {
        const selectedAccount = accounts.filter(x => x.isSelected)[0];
        this.refreshFocused = selectedAccount.id !== this.currentlyUsedAccount.id;
    }

    ngOnDestroy() {
        this.accountSub.unsubscribe();
    }

    close(): boolean {
        this.closeOverlay.next();
        return false;
    }

    next(): boolean {
        if (this.nextElements.length === 0) {
            return false;
        }

        if (this.currentElement) {
            this.previousElements.push(this.currentElement);
        }

        const nextElement = this.nextElements.pop();
        this.loadElement(nextElement);

        //if(this.nextElements.length === 0) this.canGoForward = false;       

        return false;
    }

    previous(): boolean {
        if (this.previousElements.length === 0) {
            this.closeOverlay.next();
            return false;
        }

        if (this.currentElement) {
            this.nextElements.push(this.currentElement);
        }

        const previousElement = this.previousElements.pop();
        this.loadElement(previousElement);

        //this.canGoForward = true;
        return false;
    }

    refresh(): boolean {
        this.currentlyUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.refreshFocused = false;  

        if(this.thread){
            this.appThread.refresh();
        } else if(this.hashtagElement){
            this.appHashtag.refresh();
        } else if(this.accountName){
            this.appUserProfile.refresh();
        }

        return false;
    }

    browseAccount(accountName: string): void {
        if(!accountName) return;

        this.nextElements.length = 0;
        if (this.currentElement) {
            this.previousElements.push(this.currentElement);
        }
        const newElement = new OverlayBrowsing(null, accountName, null);
        this.loadElement(newElement);
        //this.canGoForward = false;
    }

    browseHashtag(hashtag: string): void {
        if(!hashtag) return;

        this.nextElements.length = 0;
        if (this.currentElement) {
            this.previousElements.push(this.currentElement);
        }

        const selectedAccount = this.toolsService.getSelectedAccounts()[0];
        const hashTagElement = new StreamElement(StreamTypeEnum.tag, hashtag, selectedAccount.id, hashtag, null, `#${hashtag}@${selectedAccount.instance}`);
        const newElement = new OverlayBrowsing(hashTagElement, null, null);
        this.loadElement(newElement);
        // this.canGoForward = false;
    }

    browseThread(openThread: OpenThreadEvent): any {
        if(!openThread) return;

        this.nextElements.length = 0;
        if (this.currentElement) {
            this.previousElements.push(this.currentElement);
        }

        const newElement = new OverlayBrowsing(null, null, openThread);
        this.loadElement(newElement);
        //this.canGoForward = false;
    }

    private loadElement(element: OverlayBrowsing) {
        this.currentlyUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.refreshFocused = false;        

        this.currentElement = element;

        this.accountName = this.currentElement.account;
        this.thread = this.currentElement.thread;
        this.hashtagElement = this.currentElement.hashtag;
    }
}

class OverlayBrowsing {
    constructor(
        public readonly hashtag: StreamElement,
        public readonly account: string,
        public readonly thread: OpenThreadEvent) {

        if (hashtag) {
            this.type = OverlayEnum.hashtag;
        } else if (account) {
            this.type = OverlayEnum.account;
        } else if (thread) {
            this.type = OverlayEnum.thread;
        } else {
            throw Error('NotImplemented');
        }
    }

    type: OverlayEnum;
}

enum OverlayEnum {
    unknown = 0,
    hashtag = 1,
    account = 2,
    thread = 3
}
