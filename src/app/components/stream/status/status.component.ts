import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { faStar, faRetweet, faList } from "@fortawesome/free-solid-svg-icons";

import { Status, Account } from "../../../services/models/mastodon.interfaces";
import { OpenThreadEvent, ToolsService } from "../../../services/tools.service";
import { ActionBarComponent } from "./action-bar/action-bar.component";
import { StatusWrapper } from '../../../models/common.model';
import { EmojiConverter, EmojiTypeEnum } from '../../../tools/emoji.tools';

@Component({
    selector: "app-status",
    templateUrl: "./status.component.html",
    styleUrls: ["./status.component.scss"]
})
export class StatusComponent implements OnInit {
    private emojiConverter = new EmojiConverter();

    faStar = faStar;
    faRetweet = faRetweet;
    faList = faList;

    displayedStatus: Status;

    // statusAccountName: string;
    statusContent: string;

    reblog: boolean;
    hasAttachments: boolean;
    replyingToStatus: boolean;
    isCrossPoster: boolean;
    isThread: boolean;
    isContentWarned: boolean;
    hasReply: boolean;
    contentWarningText: string;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();
    @ViewChild('appActionBar') appActionBar: ActionBarComponent;

    @Input() isThreadDisplay: boolean;

    @Input() notificationType: 'mention' | 'reblog' | 'favourite' | 'poll';
    @Input() notificationAccount: Account;

    private _statusWrapper: StatusWrapper;
    status: Status;
    @Input('statusWrapper')
    set statusWrapper(value: StatusWrapper) {
        this._statusWrapper = value;
        // console.warn(value.status);
        this.status = value.status;

        if (this.status.reblog) {
            this.reblog = true;
            this.displayedStatus = this.status.reblog;
        } else {
            this.displayedStatus = this.status;
        }

        this.checkLabels(this.displayedStatus);
        this.checkContentWarning(this.displayedStatus);

        if (!this.displayedStatus.account.display_name) {
            this.displayedStatus.account.display_name = this.displayedStatus.account.username;
        }

        if (this.displayedStatus.media_attachments && this.displayedStatus.media_attachments.length > 0) {
            this.hasAttachments = true;
        }

        // const instanceUrl = 'https://' + this.status.uri.split('https://')[1].split('/')[0];
        // this.statusAccountName = this.emojiConverter.applyEmojis(this.displayedStatus.account.emojis, this.displayedStatus.account.display_name, EmojiTypeEnum.small);
        this.statusContent = this.emojiConverter.applyEmojis(this.displayedStatus.emojis, this.displayedStatus.content, EmojiTypeEnum.medium);
    }
    get statusWrapper(): StatusWrapper {
        return this._statusWrapper;
    }

    constructor() { }

    ngOnInit() {
    }

    private checkContentWarning(status: Status) {
        if (status.sensitive || status.spoiler_text) {
            this.isContentWarned = true;
            this.contentWarningText = status.spoiler_text;
        }
    }

    removeContentWarning(): boolean {
        this.isContentWarned = false;
        this.appActionBar.showContent();
        return false;
    }

    changeCw(cwIsActive: boolean) {
        this.isContentWarned = cwIsActive;
    }

    private checkLabels(status: Status) {
        //since API is limited with federated status...
        if (!status.account.bot) {
            if (status.uri.includes('birdsite.link')) {
                this.isCrossPoster = true;
            }
            else if (status.application) {
                const usedApp = status.application.name.toLowerCase();
                if (usedApp && (usedApp.includes('moa') || usedApp.includes('birdsite') || usedApp.includes('twitter'))) {
                    this.isCrossPoster = true;
                }
            }
        }

        if (this.isThreadDisplay) return;

        if (status.in_reply_to_account_id && status.in_reply_to_account_id === status.account.id) {
            this.isThread = true;
        }

        this.hasReply = status.replies_count > 0;
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

    textSelected(): boolean {
        const status = this._statusWrapper.status;
        const accountInfo = this._statusWrapper.provider;

        let openThread: OpenThreadEvent;
        if (status.reblog) {
            openThread = new OpenThreadEvent(status.reblog, accountInfo);
        } else {
            openThread = new OpenThreadEvent(status, accountInfo);
        }

        this.browseThreadEvent.next(openThread);
        return false;
    }

    openUrl(): boolean {
        event.preventDefault();
        window.open(this.displayedStatus.url, "_blank");
        return false;
    }
}
