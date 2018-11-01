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

    account: Account;
    private accountName: string;

    private thread: string;
    private hashtag: string;

    error: string;
    isLoading: boolean;

    @Output() closeOverlay = new EventEmitter();

    @Input('browseAccount')
    set browseAccount(accountName: string) {
        this.accountName = accountName;
        this.loadAccount(accountName);

        // let selectedAccounts = this.toolsService.getSelectedAccounts();
        // if(selectedAccounts.length === 0)
        //     this.error = 'no user selected';


        // this.account = account;
    }
    // get browseAccount(): string{
    //     return this.account;
    // }

    @Input('browseThread')
    set browseThread(thread: string) {
        this.thread = thread;
    }
    get browseThread(): string {
        return this.thread;
    }

    @Input('browseHashtag')
    set browseHashtag(hashtag: string) {
        this.hashtag = hashtag;
    }
    get browseHashtag(): string {
        return this.hashtag;
    }

    constructor(
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
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

    private loadAccount(accountName: string): void {
        let selectedAccounts = this.toolsService.getSelectedAccounts();
        
        if (selectedAccounts.length === 0) {
            this.error = 'no user selected';
            return;
        }

        this.isLoading = true;
        this.mastodonService.search(selectedAccounts[0], accountName, true)
            .then((result: Results) => {
                this.account = result.accounts[0];
            })
            .catch((err) => {
                this.error = 'Error when retieving account';
            })
            .then(()=>{
                this.isLoading = false;
            });
    }
}
