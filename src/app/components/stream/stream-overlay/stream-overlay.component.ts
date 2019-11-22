import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { faAngleLeft, faAngleRight, faTimes, faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { ToolsService, OpenThreadEvent } from '../../../services/tools.service';
import { StreamElement, StreamTypeEnum } from '../../../states/streams.state';
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
    hasPreviousElements: boolean;
    hasNextElements: boolean;

    loadedElements: OverlayBrowsing[] = [];
    visibleElementIndex: number = -1;

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
        if (this.visibleElementIndex >= this.loadedElements.length - 1) {
            return false;
        }    

        this.loadedElements[this.visibleElementIndex].hide();
        let newIndex = this.visibleElementIndex + 1;
        this.loadedElements[newIndex].show();
        this.visibleElementIndex = newIndex;

        this.hasPreviousElements = true;
        this.hasNextElements = this.visibleElementIndex < this.loadedElements.length - 1;

        return false;
    }

    previous(): boolean {
        if (this.visibleElementIndex <= 0) {
            this.closeOverlay.next();
            return false;
        }

        this.loadedElements[this.visibleElementIndex].hide();
        let newIndex = this.visibleElementIndex - 1;
        this.loadedElements[newIndex].show();
        this.visibleElementIndex = newIndex;

        this.hasPreviousElements = this.visibleElementIndex > 0;
        this.hasNextElements = true;

        return false;
    }

    refresh(): boolean {
        this.currentlyUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.refreshFocused = false;  

        this.loadedElements[this.visibleElementIndex].refresh();
        return false;
    }

    goToTop(): boolean {
        this.loadedElements[this.visibleElementIndex].goToTop();
        return false;
    }

    browseAccount(accountName: string): void {
        if (!accountName) return;

        const newElement = new OverlayBrowsing(null, accountName, null);
        this.loadElement(newElement);
    }

    browseHashtag(hashtag: string): void {
        if (!hashtag) return;

        const selectedAccount = this.toolsService.getSelectedAccounts()[0];
        const hashTagElement = new StreamElement(StreamTypeEnum.tag, hashtag, selectedAccount.id, hashtag, null, null, selectedAccount.instance);
        const newElement = new OverlayBrowsing(hashTagElement, null, null);
        this.loadElement(newElement);
    }

    browseThread(openThread: OpenThreadEvent): any {
        if (!openThread) return;

        const newElement = new OverlayBrowsing(null, null, openThread);
        this.loadElement(newElement);
    }

    private loadElement(element: OverlayBrowsing) {
        
        this.currentlyUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.refreshFocused = false;

        if (this.visibleElementIndex >= 0) {
            this.loadedElements[this.visibleElementIndex].hide();
            this.loadedElements = this.loadedElements.slice(0, this.visibleElementIndex + 1);
        }

        this.visibleElementIndex = this.visibleElementIndex + 1;
        this.loadedElements.push(element)
        this.loadedElements[this.visibleElementIndex].show();

        this.hasPreviousElements = this.visibleElementIndex > 0;
        this.hasNextElements = false;
    }
}

class OverlayBrowsing {   
    refreshEventEmitter = new EventEmitter();
    goToTopEventEmitter = new EventEmitter();

    constructor(
        public readonly hashtag: StreamElement,
        public readonly account: string,
        public readonly thread: OpenThreadEvent) {

        if (hashtag) {
            this.type = 'hashtag';
        } else if (account) {
            this.type = 'account';
        } else if (thread) {
            this.type = 'thread';
        } else {
            throw Error('NotImplemented');
        }
    }

    show(): any {
        setTimeout(() => {
            this.isVisible = true;
        }, 200);        
    }
    hide(): any {
        this.isVisible = false;
    }
    refresh(): any {
        this.refreshEventEmitter.next();
    }
    goToTop(): any {
        this.goToTopEventEmitter.next();
    }

    isVisible: boolean;
    type: 'hashtag' | 'account' | 'thread';
}
