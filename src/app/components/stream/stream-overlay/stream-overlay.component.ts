import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Account } from "../../../services/models/mastodon.interfaces";

@Component({
    selector: 'app-stream-overlay',
    templateUrl: './stream-overlay.component.html',
    styleUrls: ['./stream-overlay.component.scss']
})
export class StreamOverlayComponent implements OnInit {
    private account: Account;
    private thread: string;
    private hashtag: string;

    @Output() closeOverlay = new EventEmitter();

    @Input('browseAccount') 
    set browseAccount(account: Account) {
        this.account = account;        
    }
    get browseAccount(): Account{
        return this.account;
    }

    @Input('browseThread') 
    set browseThread(thread: string) {
        this.thread = thread;        
    }
    get browseThread(): string{
        return this.thread;
    }

    @Input('browseHashtag') 
    set browseHashtag(hashtag: string) {
        this.hashtag = hashtag;        
    }
    get browseHashtag(): string{
        return this.hashtag;
    }

    constructor() { }

    ngOnInit() {
    }

    close(): boolean {
        this.closeOverlay.next();
        return false;
    }

}
