import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Status, Account } from "../../../services/models/mastodon.interfaces";
import { StatusWrapper } from "../stream.component";
import { OpenThreadEvent } from "../../../services/tools.service";
import { stat } from "fs";

@Component({
    selector: "app-status",
    templateUrl: "./status.component.html",
    styleUrls: ["./status.component.scss"]
})
export class StatusComponent implements OnInit {
    displayedStatus: Status;
    reblog: boolean;
    hasAttachments: boolean;
    replyingToStatus: boolean;
    isCrossPoster: boolean;
    isContentWarned: boolean;
    contentWarningText: string;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    private _statusWrapper: StatusWrapper;
    status: Status;
    @Input('statusWrapper')
    set statusWrapper(value: StatusWrapper) {
        this._statusWrapper = value;
        this.status = value.status;

        this.checkCrossPosting(this.status);
        this.checkContentWarning(this.status);

        if (this.status.reblog) {
            this.reblog = true;
            this.displayedStatus = this.status.reblog;
        } else {
            this.displayedStatus = this.status;
        }

        if (!this.displayedStatus.account.display_name) {
            this.displayedStatus.account.display_name = this.displayedStatus.account.username;
        }

        if (this.displayedStatus.media_attachments && this.displayedStatus.media_attachments.length > 0) {
            this.hasAttachments = true;
        }
    }
    get statusWrapper(): StatusWrapper {
        return this._statusWrapper;
    }

    constructor() { }

    ngOnInit() {
    }

    private checkContentWarning(status: Status) {
        if(status.sensitive || status.spoiler_text){
            this.isContentWarned = true;
            this.contentWarningText = status.spoiler_text;
        }
    }

    removeContentWarning(): boolean {
        this.isContentWarned = false;
        return false;
    }

    private checkCrossPosting(status: Status) {
        //since API is limited with federated status...
        if(status.uri.includes('birdsite.link')){
            this.isCrossPoster = true;
        }

        if (status.application) {
            const usedApp = status.application.name.toLowerCase();
            if (usedApp && (usedApp.includes('moa') || usedApp.includes('birdsite') || usedApp.includes('twitter'))) {
                this.isCrossPoster = true;
            }
        }
    }

    openAccount(account: Account): boolean {
        let accountName = account.acct;
        if (!accountName.includes('@'))
            accountName += `@${account.url.replace('https://', '').split('/')[0]}`;

        this.browseAccountEvent.next(accountName);
        return false;
    }

    openReply(): boolean {
        this.replyingToStatus = !this.replyingToStatus;

        return false;
    }

    closeReply(): boolean {
        this.replyingToStatus = false;
        return false;
    }

    accountSelected(accountName: string): void {
        this.browseAccountEvent.next(accountName);
    }

    hashtagSelected(hashtag: string): void {
        this.browseHashtagEvent.next(hashtag);
    }

    textSelected(): void {
        const status = this._statusWrapper.status;
        const accountInfo = this._statusWrapper.provider;

        let openThread: OpenThreadEvent;
        if (status.reblog) {
            openThread = new OpenThreadEvent(status.reblog, accountInfo);
        } else {
            openThread = new OpenThreadEvent(status, accountInfo);
        }

        this.browseThreadEvent.next(openThread);
    }
}
