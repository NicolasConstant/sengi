import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { faStar, faRetweet, faList, faThumbtack } from "@fortawesome/free-solid-svg-icons";

import { Status, Account } from "../../../services/models/mastodon.interfaces";
import { OpenThreadEvent, ToolsService } from "../../../services/tools.service";
import { ActionBarComponent } from "./action-bar/action-bar.component";
import { StatusWrapper } from '../../../models/common.model';
import { EmojiConverter, EmojiTypeEnum } from '../../../tools/emoji.tools';
import { ContentWarningPolicyEnum } from '../../../states/settings.state';
import { stat } from 'fs';

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
    faThumbtack = faThumbtack;

    displayedStatus: Status;
    displayedStatusWrapper: StatusWrapper;

    // statusAccountName: string;
    statusContent: string;

    reblog: boolean;
    hasAttachments: boolean;
    replyingToStatus: boolean;
    isCrossPoster: boolean;
    isThread: boolean;
    isOld: boolean;
    isContentWarned: boolean;
    hasReply: boolean;
    contentWarningText: string;
    isDirectMessage: boolean;
    isSelected: boolean;

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
        this.isSelected = value.isSelected;

        if (this.status.reblog) {
            this.reblog = true;
            this.displayedStatus = this.status.reblog;
        } else {
            this.displayedStatus = this.status;
        }

        this.isDirectMessage = this.displayedStatus.visibility === 'direct';
        this.displayedStatusWrapper = new StatusWrapper(this.displayedStatus, value.provider);

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

    constructor(
        public elem: ElementRef,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
    }

    private checkContentWarning(status: Status) {
        let cwPolicy = this.toolsService.getSettings().contentWarningPolicy;

        let splittedContent = [];
        if ((cwPolicy.policy === ContentWarningPolicyEnum.HideAll && cwPolicy.addCwOnContent.length > 0) 
            || (cwPolicy.policy === ContentWarningPolicyEnum.AddOnAllContent && cwPolicy.removeCwOnContent.length > 0)) {
            let parser = new DOMParser();
            let dom = parser.parseFromString((status.content + ' ' + status.spoiler_text).replace("<br/>", " ").replace("<br>", " ").replace(/\n/g, ' '), 'text/html')
            let contentToParse = dom.body.textContent;
            splittedContent = contentToParse.toLowerCase().split(' ');
        }

        if (cwPolicy.policy === ContentWarningPolicyEnum.None && (status.sensitive || status.spoiler_text)) {
            this.setContentWarning(status);
        } else if (cwPolicy.policy === ContentWarningPolicyEnum.HideAll) {
            let detected = cwPolicy.addCwOnContent.filter(x => splittedContent.find(y => y == x || y == `#${x}`));
            if (!detected || detected.length === 0) {
                this.status.sensitive = false;
                return;
            }

            if (!status.spoiler_text) {
                status.spoiler_text = detected.join(' ');
            }
            this.setContentWarning(status);
        } else if (cwPolicy.policy === ContentWarningPolicyEnum.AddOnAllContent) {
            let detected = cwPolicy.removeCwOnContent.find(x => splittedContent.find(y => y == x) != null) != null;

            if (!detected) {
                this.setContentWarning(status);
            } else {
                this.status.sensitive = false;
            }
        }
    }

    private setContentWarning(status: Status) {
        this.status.sensitive = true;
        this.isContentWarned = true;
        this.contentWarningText = this.emojiConverter.applyEmojis(this.displayedStatus.emojis, status.spoiler_text, EmojiTypeEnum.medium);
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

        let createdAt = new Date(status.created_at);
        let now = new Date();
        now.setMonth(now.getMonth() - 3);
        if (now > createdAt) {
            this.isOld = true;
        }
    }

    openAccount(account: Account): boolean {
        let accountName = this.toolsService.getAccountFullHandle(account);
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
        if (this.isSelected) return false;

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

    browseThread(event: OpenThreadEvent): void {
        this.browseThreadEvent.next(event);
    }

    openUrl(url: string): boolean {
        event.preventDefault();
        window.open(url, "_blank");
        return false;
    }
}
