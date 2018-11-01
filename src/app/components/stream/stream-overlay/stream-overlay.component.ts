import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Account, Results } from "../../../services/models/mastodon.interfaces";
import { MastodonService } from '../../../services/mastodon.service';
import { ToolsService } from '../../../services/tools.service';

@Component({
    selector: 'app-stream-overlay',
    templateUrl: './stream-overlay.component.html',
    styleUrls: ['./stream-overlay.component.scss']
})
export class StreamOverlayComponent implements OnInit {
    canRefresh: boolean;
    canGoForward: boolean;

    // account: Account;
    accountName: string;
    private thread: string;
    hashtag: string;

    error: string;
    isLoading: boolean;

    @Output() closeOverlay = new EventEmitter();

    @Input('browseAccount')
    set browseAccount(accountName: string) {     
        // console.warn(`browseAccount ${accountName}`);
        this.accountName = accountName;
        // if(accountName) this.loadAccount(accountName);
    }

    @Input('browseThread')
    set browseThread(thread: string) {
        // console.warn(`browseThread ${thread}`);
        this.thread = thread;
    }

    @Input('browseHashtag')
    set browseHashtag(hashtag: string) {
        // console.warn(`browseHashtag ${hashtag}`);
        this.hashtag = hashtag;
    }   

    constructor(
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        console.warn('ngOnInit stream-overlay');
    }

    close(): boolean {
        this.closeOverlay.next();
        return false;
    }
    
    next(): boolean {
        return false;
    }

    previous(): boolean {
        return false;
    }

    refresh(): boolean {
        return false;
    }

    accountSelected(accountName: string): void {
        this.accountName = accountName;
        // this.loadAccount(accountName);
    }

    hashtagSelected(hashtag: string): void {
    }   
}
