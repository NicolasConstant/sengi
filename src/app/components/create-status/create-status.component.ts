import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, ViewContainerRef, ComponentRef, HostListener } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Overlay, OverlayConfig, FullscreenOverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Store } from '@ngxs/store';
import { Subscription, Observable } from 'rxjs';
import { UP_ARROW, DOWN_ARROW, ENTER, ESCAPE } from '@angular/cdk/keycodes';
import { faPaperclip, faGlobe, faGlobeAmericas, faLock, faLockOpen, faEnvelope, faPollH } from "@fortawesome/free-solid-svg-icons";
import { faClock, faWindowClose as faWindowCloseRegular } from "@fortawesome/free-regular-svg-icons";
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';

import { VisibilityEnum, PollParameters } from '../../services/mastodon.service';
import { MastodonWrapperService } from '../../services/mastodon-wrapper.service';
import { Status, Attachment } from '../../services/models/mastodon.interfaces';
import { ToolsService, InstanceInfo, InstanceType } from '../../services/tools.service';
import { NotificationService } from '../../services/notification.service';
import { StatusWrapper } from '../../models/common.model';
import { AccountInfo } from '../../states/accounts.state';
import { InstancesInfoService } from '../../services/instances-info.service';
import { MediaService, MediaWrapper } from '../../services/media.service';
import { AutosuggestSelection, AutosuggestUserActionEnum } from './autosuggest/autosuggest.component';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker.component';
import { PollEditorComponent } from './poll-editor/poll-editor.component';
import { StatusSchedulerComponent } from './status-scheduler/status-scheduler.component';
import { ScheduledStatusService } from '../../services/scheduled-status.service';
import { StatusesStateService } from '../../services/statuses-state.service';
import { SettingsService } from '../../services/settings.service';

@Component({
    selector: 'app-create-status',
    templateUrl: './create-status.component.html',
    styleUrls: ['./create-status.component.scss']
})
export class CreateStatusComponent implements OnInit, OnDestroy {
    faPaperclip = faPaperclip;
    faGlobe = faGlobe;
    faGlobeAmericas = faGlobeAmericas;
    faLock = faLock;
    faLockOpen = faLockOpen;
    faEnvelope = faEnvelope;
    faPollH = faPollH;
    faClock = faClock;

    autoSuggestUserActionsStream = new EventEmitter<AutosuggestUserActionEnum>();
    private isRedrafting: boolean;

    private _title: string;
    set title(value: string) {
        this._title = value;
        this.countStatusChar(this.status);
    }
    get title(): string {
        return this._title;
    }

    private _status: string = '';
    @Input('status')
    set status(value: string) {
        if (this.isRedrafting) {
            this.statusStateService.setStatusContent(value, null);
        } else {
            this.statusStateService.setStatusContent(value, this.statusReplyingToWrapper);
        }
        this.countStatusChar(value);
        this.detectAutosuggestion(value);
        this._status = value;

        setTimeout(() => {
            this.autoGrow();
        }, 0);
    }
    get status(): string {
        return this._status;
    }

    private trim(s, mask) {
        while (~mask.indexOf(s[0])) {
            s = s.slice(1);
        }
        while (~mask.indexOf(s[s.length - 1])) {
            s = s.slice(0, -1);
        }
        return s;
    }

    @Input('redraftedStatus')
    set redraftedStatus(value: StatusWrapper) {
        if (value) {
            this.isRedrafting = true;
            this.statusLoaded = false;

            if (value.status && value.status.media_attachments) {
                for (const m of value.status.media_attachments) {
                    this.mediaService.addExistingMedia(new MediaWrapper(m.id, null, m));
                }
            }

            const newLine = String.fromCharCode(13, 10);
            let content = value.status.content;

            content = this.transformHtmlRepliesToReplies(content);

            while (content.includes('<p>') || content.includes('</p>') || content.includes('<br>') || content.includes('<br/>') || content.includes('<br />')) {
                content = content.replace('<p>', '').replace('</p>', newLine + newLine).replace('<br />', newLine).replace('<br/>', newLine).replace('<br>', newLine);
            }

            content = this.trim(content, newLine);

            let parser = new DOMParser();
            var dom = parser.parseFromString(content, 'text/html')
            this.status = dom.body.textContent;

            // this.statusStateService.setStatusContent(this.status, this.statusReplyingToWrapper);

            this.setVisibilityFromStatus(value.status);
            this.title = value.status.spoiler_text;
            this.statusLoaded = true;

            if (value.status.in_reply_to_id) {
                this.isSending = true;
                this.mastodonService.getStatus(value.provider, value.status.in_reply_to_id)
                    .then((status: Status) => {
                        let cwResult = this.toolsService.checkContentWarning(status);
                        this.statusReplyingToWrapper = new StatusWrapper(cwResult.status, value.provider, cwResult.applyCw, cwResult.hide);
                    })
                    .catch(err => {
                        this.notificationService.notifyHttpError(err, value.provider);
                    })
                    .then(() => {
                        this.isSending = false;
                    });
            }
        }
    }

    private maxCharLength: number;
    charCountLeft: number;
    postCounts: number = 1;
    isSending: boolean;
    mentionTooFarAwayError: boolean;
    autosuggestData: string = null;
    instanceSupportsPoll = true;
    instanceSupportsScheduling = true;
    private statusLoaded: boolean;
    private hasSuggestions: boolean;

    @Input() statusReplyingToWrapper: StatusWrapper;
    @Output() onClose = new EventEmitter();
    @ViewChild('reply') replyElement: ElementRef;
    @ViewChild('fileInput') fileInputElement: ElementRef;
    @ViewChild('footer') footerElement: ElementRef;
    @ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;
    @ViewChild(PollEditorComponent) pollEditor: PollEditorComponent;
    @ViewChild(StatusSchedulerComponent) statusScheduler: StatusSchedulerComponent;

    private _isDirectMention: boolean;
    @Input('isDirectMention')
    set isDirectMention(value: boolean) {
        if (value) {
            this._isDirectMention = value;
            this.initMention();
        }
    }
    get isDirectMention(): boolean {
        return this._isDirectMention;
    }

    private _replyingUserHandle: string;
    @Input('replyingUserHandle')
    set replyingUserHandle(value: string) {
        if (value) {
            this._replyingUserHandle = value;
            this.initMention();
        }
    }
    get replyingUserHandle(): string {
        return this._replyingUserHandle;
    }

    private statusReplyingTo: Status;

    selectedPrivacy = 'Public';
    private selectedPrivacySetByRedraft = false;

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;
    private selectedAccount: AccountInfo;

    constructor(
        private readonly settingsService: SettingsService,
        private statusStateService: StatusesStateService,
        private readonly scheduledStatusService: ScheduledStatusService,
        private readonly contextMenuService: ContextMenuService,
        private readonly store: Store,
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly instancesInfoService: InstancesInfoService,
        private readonly mediaService: MediaService,
        private readonly overlay: Overlay,
        public viewContainerRef: ViewContainerRef) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        if (!this.isRedrafting) {
            this.status = this.statusStateService.getStatusContent(this.statusReplyingToWrapper);
        }

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.accountChanged(accounts);
        });
        this.selectedAccount = this.toolsService.getSelectedAccounts()[0];

        if (this.statusReplyingToWrapper) {
            if (this.statusReplyingToWrapper.status.reblog) {
                this.statusReplyingTo = this.statusReplyingToWrapper.status.reblog;
            } else {
                this.statusReplyingTo = this.statusReplyingToWrapper.status;
            }

            // let state = this.statusStateService.getStatusContent(this.statusReplyingToWrapper);
            // if (state && state !== '') {
            //     this.status = state;
            // } else {
            if (!this.status || this.status === '') {
                const uniqueMentions = this.getMentions(this.statusReplyingTo);
                for (const mention of uniqueMentions) {
                    this.status += `@${mention} `;
                }
            }

            this.setVisibilityFromStatus(this.statusReplyingTo);

            this.title = this.statusReplyingTo.spoiler_text;
        } else if (this.replyingUserHandle) {
            this.initMention();
        }

        this.statusLoaded = true;
        this.focus();

        this.innerHeight = window.innerHeight;
    }

    ngOnDestroy() {
        if (this.isRedrafting) {
            this.statusStateService.resetStatusContent(null);
        }

        this.accountSub.unsubscribe();
    }

    onPaste(e: any) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let blobs: File[] = [];
        for (const item of items) {
            if (item.type.indexOf('image') === 0) {
                let blob = item.getAsFile();
                blobs.push(blob);
            }
        }
        this.handleFileInput(blobs);
    }

    changePrivacy(value: string): boolean {
        this.selectedPrivacy = value;
        return false;
    }

    addMedia(): boolean {
        this.fileInputElement.nativeElement.click();
        return false;
    }

    handleFileInput(files: File[]): boolean {
        const acc = this.toolsService.getSelectedAccounts()[0];
        this.mediaService.uploadMedia(acc, files);
        return false;
    }

    private detectAutosuggestion(status: string) {
        if (!this.statusLoaded) return;

        if (!status.includes('@') && !status.includes('#')) {
            this.autosuggestData = null;
            this.hasSuggestions = false;
            return;
        }

        const caretPosition = this.replyElement.nativeElement.selectionStart;

        const lastChar = status.substr(caretPosition - 1, 1);
        const lastCharIsSpace = lastChar === ' ';

        const splitStatus = status.split(/(\r\n|\n|\r)/);
        let offset = 0;
        let currentSection = '';
        for (let x of splitStatus) {
            const sectionLength = x.length;
            if (offset + sectionLength >= caretPosition) {
                currentSection = x;
                break;
            } else {
                offset += sectionLength;
            }
        };

        const word = this.getWordByPos(currentSection, caretPosition - offset);
        if (!lastCharIsSpace && word && word.length > 0 && (word.startsWith('@') || word.startsWith('#'))) {
            this.autosuggestData = word;
            return;
        }

        this.autosuggestData = null;
        this.hasSuggestions = false;
    }

    private getWordByPos(str, pos) {
        var preText = str.substring(0, pos);
        if (preText.indexOf(" ") > 0) {
            var words = preText.split(" ");
            return words[words.length - 1]; //return last word
        }
        else {
            return preText;
        }

        // // str = str.replace(/(\r\n|\n|\r)/gm, "");
        // var left = str.substr(0, pos);
        // var right = str.substr(pos);

        // left = left.replace(/^.+ /g, "");
        // right = right.replace(/ .+$/g, "");

        // return left + right;
    }

    private focus(caretPos = null) {
        setTimeout(() => {
            this.replyElement.nativeElement.focus();

            if (caretPos) {
                this.replyElement.nativeElement.setSelectionRange(caretPos, caretPos);
            } else {
                this.replyElement.nativeElement.setSelectionRange(this.status.length, this.status.length);
            }
        }, 0);
    }

    private initMention() {
        this.statusLoaded = false;

        if (!this.selectedAccount) {
            this.selectedAccount = this.toolsService.getSelectedAccounts()[0];
        }

        if (this.isDirectMention) {
            this.setVisibility(VisibilityEnum.Direct);
        } else {
            this.getDefaultPrivacy();
        }
        this.status = `${this.replyingUserHandle} `;
        this.countStatusChar(this.status);

        this.statusLoaded = true;
        this.focus();
    }

    private accountChanged(accounts: AccountInfo[]): void {
        if (accounts && accounts.length > 0) {
            this.selectedAccount = accounts.filter(x => x.isSelected)[0];

            const settings = this.settingsService.getAccountSettings(this.selectedAccount);
            if (settings.customStatusCharLengthEnabled) {
                this.maxCharLength = settings.customStatusCharLength;
                this.countStatusChar(this.status);
            } else {
                this.instancesInfoService.getMaxStatusChars(this.selectedAccount.instance)
                    .then((maxChars: number) => {
                        this.maxCharLength = maxChars;
                        this.countStatusChar(this.status);
                    })
                    .catch((err: HttpErrorResponse) => {
                        this.notificationService.notifyHttpError(err, this.selectedAccount);
                    });
            }

            if (!this.statusReplyingToWrapper && !this.replyingUserHandle) {
                this.getDefaultPrivacy();
            }

            this.toolsService.getInstanceInfo(this.selectedAccount)
                .then((instance: InstanceInfo) => {
                    if (instance.type === InstanceType.Pixelfed) {
                        this.instanceSupportsPoll = false;
                        this.instanceSupportsScheduling = false;
                        this.pollIsActive = false;
                        this.scheduleIsActive = false;
                    } else {
                        this.instanceSupportsPoll = true;
                        this.instanceSupportsScheduling = true;
                    }
                });
        }
    }

    private getDefaultPrivacy() {
        this.instancesInfoService.getDefaultPrivacy(this.selectedAccount)
            .then((defaultPrivacy: VisibilityEnum) => {
                this.setVisibility(defaultPrivacy);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, this.selectedAccount);
            });
    }

    private setVisibilityFromStatus(status: Status) {
        switch (status.visibility) {
            case 'unlisted':
                this.setVisibility(VisibilityEnum.Unlisted);
                break;
            case 'public':
                this.setVisibility(VisibilityEnum.Public);
                break;
            case 'private':
                this.setVisibility(VisibilityEnum.Private);
                break;
            case 'direct':
                this.setVisibility(VisibilityEnum.Direct);
                break;
        }

        this.selectedPrivacySetByRedraft = true;
    }

    private setVisibility(defaultPrivacy: VisibilityEnum) {
        if(this.selectedPrivacySetByRedraft) return;

        switch (defaultPrivacy) {
            case VisibilityEnum.Public:
                this.selectedPrivacy = 'Public';
                break;
            case VisibilityEnum.Unlisted:
                this.selectedPrivacy = 'Unlisted';
                break;
            case VisibilityEnum.Private:
                this.selectedPrivacy = 'Follows-only';
                break;
            case VisibilityEnum.Direct:
                this.selectedPrivacy = 'DM';
                break;
        }
    }

    private countStatusChar(status: string) {
        this.mentionTooFarAwayError = false;
        const parseStatus = this.parseStatus(status);

        const mentions = this.getMentionsFromStatus(status);
        if (mentions.length > 0) {
            let containAllMention = true;
            mentions.forEach(m => {
                if (!parseStatus[0].includes(m)) {
                    containAllMention = false;
                }
            });

            if (!containAllMention) {
                this.mentionTooFarAwayError = true;
                this.charCountLeft = this.maxCharLength - status.length;
                this.postCounts = 1;
                return;
            }
        }

        const currentStatus = parseStatus[parseStatus.length - 1];
        const statusExtraChars = this.getMentionExtraChars(currentStatus);
        const linksExtraChars = this.getLinksExtraChars(currentStatus);

        const statusLength = [...currentStatus].length - statusExtraChars - linksExtraChars;
        this.charCountLeft = this.maxCharLength - statusLength - this.getCwLength();
        this.postCounts = parseStatus.length;
    }

    private getCwLength(): number {
        let cwLength = 0;
        if (this.title) {
            cwLength = [...this.title].length;
        }
        return cwLength;
    }

    private getMentions(status: Status): string[] {
        let acct = status.account.acct;
        if(!acct.includes('@')) {
            acct += `@${status.account.url.replace('https://', '').split('/')[0]}`
        }

        const mentions = [acct];
        status.mentions.forEach(m => {
            let mentionAcct = m.acct;
            if(!mentionAcct.includes('@')){
                mentionAcct += `@${m.url.replace('https://', '').split('/')[0]}`;
            }
            mentions.push(mentionAcct);
        });

        let uniqueMentions = [];
        for (let mention of mentions) {
            if (!uniqueMentions.includes(mention)) {
                uniqueMentions.push(mention);
            }
        }

        const selectedUser = this.toolsService.getSelectedAccounts()[0];
        uniqueMentions = uniqueMentions.filter(x => x.toLowerCase() !== `${selectedUser.username}@${selectedUser.instance}`.toLowerCase());

        return uniqueMentions;
    }

    onCtrlEnter(): boolean {
        this.onSubmit();
        return false;
    }

    onSubmit(): boolean {
        if (this.isSending || this.mentionTooFarAwayError) return false;

        this.isSending = true;

        let visibility: VisibilityEnum = VisibilityEnum.Unknown;
        switch (this.selectedPrivacy) {
            case 'Public':
                visibility = VisibilityEnum.Public;
                break;
            case 'Unlisted':
                visibility = VisibilityEnum.Unlisted;
                break;
            case 'Follows-only':
                visibility = VisibilityEnum.Private;
                break;
            case 'DM':
                visibility = VisibilityEnum.Direct;
                break;
        }

        const mediaAttachments = this.mediaService.mediaSubject.value.map(x => x.attachment);

        const acc = this.toolsService.getSelectedAccounts()[0];
        let usableStatus: Promise<Status>;
        if (this.statusReplyingToWrapper) {
            usableStatus = this.toolsService.getStatusUsableByAccount(acc, this.statusReplyingToWrapper);
        } else {
            usableStatus = Promise.resolve(null);
        }

        let poll: PollParameters = null;
        if (this.pollIsActive) {
            poll = this.pollEditor.getPollParameters();
        }

        let scheduledTime = null;
        if (this.scheduleIsActive) {
            scheduledTime = this.statusScheduler.getScheduledDate();
            if (!scheduledTime || scheduledTime === '') {
                this.isSending = false;
                return;
            }
        }

        usableStatus
            .then((status: Status) => {
                return this.sendStatus(acc, this.status, visibility, this.title, status, mediaAttachments, poll, scheduledTime);
            })
            .then((res: Status) => {
                this.title = '';
                this.status = '';
                this.onClose.emit();

                if (this.scheduleIsActive) {
                    this.scheduledStatusService.statusAdded(acc);
                }

                if (this.isRedrafting) {
                    this.statusStateService.resetStatusContent(null);
                } else {
                    this.statusStateService.resetStatusContent(this.statusReplyingToWrapper);
                }
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err, acc);
            })
            .then(() => {
                this.isSending = false;
            });

        return false;
    }

    private sendStatus(account: AccountInfo, status: string, visibility: VisibilityEnum, title: string, previousStatus: Status, attachments: Attachment[], poll: PollParameters, scheduledAt: string): Promise<Status> {
        let parsedStatus = this.parseStatus(status);
        let resultPromise = Promise.resolve(previousStatus);

        for (let i = 0; i < parsedStatus.length; i++) {
            let s = parsedStatus[i];
            resultPromise = resultPromise
                .then((pStatus: Status) => {
                    let inReplyToId = null;
                    if (pStatus) {
                        inReplyToId = pStatus.id;
                    }

                    if (i === 0) {
                        return this.mastodonService.postNewStatus(account, s, visibility, title, inReplyToId, attachments.map(x => x.id), poll, scheduledAt)
                            .then((status: Status) => {
                                this.mediaService.clearMedia();
                                return status;
                            });
                    } else {
                        return this.mastodonService.postNewStatus(account, s, visibility, title, inReplyToId, [], null, scheduledAt);
                    }
                })
                .then((status: Status) => {
                    if (this.statusReplyingToWrapper) {
                        let cwPolicy = this.toolsService.checkContentWarning(status);
                        this.notificationService.newStatusPosted(this.statusReplyingToWrapper.status.id, new StatusWrapper(cwPolicy.status, account, cwPolicy.applyCw, cwPolicy.hide));
                    }

                    return status;
                });
        }

        return resultPromise;
    }

    private parseStatus(status: string): string[] {
        //console.error(status.toString());

        let mentionExtraChars = this.getMentionExtraChars(status);
        let urlExtraChar = this.getLinksExtraChars(status);
        let truncatedStatus = `${status}`;
        let results = [];

        let aggregateMention = '';
        let mentions = this.getMentionsFromStatus(status);
        mentions.forEach(x => {
            aggregateMention += `${x} `;
        });

        let currentMaxCharLength = this.maxCharLength + mentionExtraChars + urlExtraChar - this.getCwLength();
        let maxChars = currentMaxCharLength - 6;

        while (truncatedStatus.length > currentMaxCharLength) {
            const nextIndex = truncatedStatus.lastIndexOf(' ', maxChars);
            
            if(nextIndex === -1){
                break;
            }

            results.push(truncatedStatus.substr(0, nextIndex) + ' (...)');
            truncatedStatus = aggregateMention + truncatedStatus.substr(nextIndex + 1);

            // Refresh max
            let mentionExtraChars = this.getMentionExtraChars(truncatedStatus);
            let urlExtraChar = this.getLinksExtraChars(truncatedStatus);
            currentMaxCharLength = this.maxCharLength + mentionExtraChars + urlExtraChar - this.getCwLength();
            maxChars = currentMaxCharLength - 6;
        }
        results.push(truncatedStatus);
        return results;
    }

    private getLinksExtraChars(status: string): number {
        let mentionExtraChars = 0;
        let links = status.split(/\s+/).filter(x => x.startsWith('http://') || x.startsWith('https://'));
        for (let link of links) {
            if (link.length > 23) {
                mentionExtraChars += link.length - 23;
            }
        }

        return mentionExtraChars;
    }

    private getMentionExtraChars(status: string): number {
        let mentionExtraChars = 0;
        let mentions = this.getMentionsFromStatus(status);

        for (const mention of mentions) {
            if (mention.lastIndexOf('@') !== 0) {
                const domain = mention.split('@')[2];
                if (domain.length > 1) {
                    mentionExtraChars += (domain.length + 1);
                }
            }
        }
        return mentionExtraChars;
    }

    private getMentionsFromStatus(status: string): string[] {
        return status.split(' ').filter(x => x.indexOf('@') === 0 && x.length > 1);
    }

    suggestionSelected(selection: AutosuggestSelection) {
        if (this.status.includes(selection.pattern)) {
            this.status = this.replacePatternWithAutosuggest(this.status, selection.pattern, selection.autosuggest);
            
            let cleanStatus = this.status.replace(/\r?\n/g, ' ');            
            let newCaretPosition = cleanStatus.indexOf(`${selection.autosuggest}`) + selection.autosuggest.length;
            if (newCaretPosition > cleanStatus.length) newCaretPosition = cleanStatus.length;

            this.autosuggestData = null;
            this.hasSuggestions = false;

            if (document.activeElement === this.replyElement.nativeElement) {
                setTimeout(() => {
                    this.replyElement.nativeElement.setSelectionRange(newCaretPosition, newCaretPosition);
                }, 0);
            } else {
                this.focus(newCaretPosition);
            }
        }
    }

    private replacePatternWithAutosuggest(status: string, pattern: string, autosuggest: string): string {
        status = status.replace(/  /g, ' ');

        const newLine = String.fromCharCode(13, 10);
        // let statusPerLines = status.split(newLine);
        let statusPerLines = status.split(/\r?\n/);
        let statusPerLinesPerWords: string[][] = [];
        let regex = new RegExp(`^${pattern}$`, 'i');

        statusPerLines.forEach(line => {
            let words = line.split(' ');

            words = words.map(word => {
                return word.replace(regex, `${autosuggest}`);
            });

            statusPerLinesPerWords.push(words);
        });

        let result = '';
        let nberLines = statusPerLinesPerWords.length;
        let i = 0;

        statusPerLinesPerWords.forEach(line => {
            i++;

            let wordCount = line.length;
            let w = 0;
            line.forEach(word => {
                w++;
                result += `${word}`;

                if(w < wordCount || i === nberLines){
                    result += ' ';
                }
            });
            if (i < nberLines) {
                result += newLine;
            }
        })

        result = result.replace('  ', ' ');

        let endRegex = new RegExp(`${autosuggest} $`, 'i');
        if(!result.match(endRegex)){
            result = result.substring(0, result.length - 1);
        }

        return result;
    }

    suggestionsChanged(hasSuggestions: boolean) {
        this.hasSuggestions = hasSuggestions;
    }

    handleKeyDown(event: KeyboardEvent): boolean {
        if (this.hasSuggestions) {
            let keycode = event.keyCode;
            if (keycode === DOWN_ARROW || keycode === UP_ARROW || keycode === ENTER || keycode === ESCAPE) {
                event.stopImmediatePropagation();
                event.preventDefault();
                event.stopPropagation();

                switch (keycode) {
                    case DOWN_ARROW:
                        this.autoSuggestUserActionsStream.next(AutosuggestUserActionEnum.MoveDown);
                        break;
                    case UP_ARROW:
                        this.autoSuggestUserActionsStream.next(AutosuggestUserActionEnum.MoveUp);
                        break;
                    case ENTER:
                        this.autoSuggestUserActionsStream.next(AutosuggestUserActionEnum.Validate);
                        break;
                    case ESCAPE:
                        this.autosuggestData = null;
                        this.hasSuggestions = false;
                        break;
                }

                return false;
            }
        }
    }

    statusTextEditorLostFocus(): boolean {
        setTimeout(() => {
            this.autosuggestData = null;
            this.hasSuggestions = false;
        }, 250);
        return false;
    }

    private autoGrow() {
        let scrolling = (this.replyElement.nativeElement.scrollHeight);

        if (scrolling > 110) {
            const isVisible = this.checkVisible(this.footerElement.nativeElement);
            //this.replyElement.nativeElement.style.height = `0px`;
            this.replyElement.nativeElement.style.height = `${this.replyElement.nativeElement.scrollHeight}px`;

            if (isVisible) {
                setTimeout(() => {
                    try {
                        this.footerElement.nativeElement.scrollIntoViewIfNeeded({ behavior: 'instant', block: 'end', inline: 'start' });
                    } catch (err) {
                        this.footerElement.nativeElement.scrollIntoView({ behavior: 'instant', block: 'end', inline: 'start' });
                    }
                }, 0);
            }
        }
    }

    private checkVisible(elm) {
        var rect = elm.getBoundingClientRect();
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }

    public onContextMenu($event: MouseEvent): void {
        this.contextMenuService.show.next({
            // Optional - if unspecified, all context menu components will open
            contextMenu: this.contextMenu,
            event: $event,
            item: null
        });
        $event.preventDefault();
        $event.stopPropagation();
    }

    //https://stackblitz.com/edit/overlay-demo
    @ViewChild('emojiButton') emojiButtonElement: ElementRef;
    overlayRef: OverlayRef;

    public innerHeight: number;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.innerHeight = window.innerHeight;
    }

    private emojiCloseSub: Subscription;
    private emojiSelectedSub: Subscription;
    private beforeEmojiCaretPosition: number;
    openEmojiPicker(e: MouseEvent): boolean {
        if (this.overlayRef) return false;

        this.beforeEmojiCaretPosition = this.replyElement.nativeElement.selectionStart;

        let topPosition = e.pageY;
        if (this.innerHeight - e.pageY < 360) {
            topPosition -= 360;
        }

        let config = new OverlayConfig();
        config.positionStrategy = this.overlay.position()
            .global()
            .left(`${e.pageX - 283}px`)
            .top(`${topPosition}px`);
        config.hasBackdrop = true;

        this.overlayRef = this.overlay.create(config);
        // this.overlayRef.backdropClick().subscribe(() => {
        //     this.overlayRef.dispose();
        // });

        let comp = new ComponentPortal(EmojiPickerComponent);
        const compRef: ComponentRef<EmojiPickerComponent> = this.overlayRef.attach(comp);
        this.emojiCloseSub = compRef.instance.closedEvent.subscribe(() => {
            this.closeEmojiPanel();
        });
        this.emojiSelectedSub = compRef.instance.emojiSelectedEvent.subscribe((emoji) => {
            if (emoji) {
                this.status = [this.status.slice(0, this.beforeEmojiCaretPosition), emoji, ' ', this.status.slice(this.beforeEmojiCaretPosition)].join('').replace('  ', ' ');
                this.beforeEmojiCaretPosition += emoji.length + 1;

                this.closeEmojiPanel();
            }
        });

        return false;
    }

    private closeEmojiPanel() {
        if (this.emojiCloseSub) this.emojiCloseSub.unsubscribe();
        if (this.emojiSelectedSub) this.emojiSelectedSub.unsubscribe();
        if (this.overlayRef) this.overlayRef.dispose();
        this.overlayRef = null;
        this.focus(this.beforeEmojiCaretPosition);
    }

    closeEmoji(): boolean {
        this.overlayRef.dispose();
        return false;
    }

    pollIsActive: boolean;
    addPoll(): boolean {
        this.pollIsActive = !this.pollIsActive;
        return false;
    }

    scheduleIsActive: boolean;
    schedule(): boolean {
        this.scheduleIsActive = !this.scheduleIsActive;
        return false;
    }

    private transformHtmlRepliesToReplies(data: string): string {
        const mastodonMentionRegex = /<span class="h-card"><a href="https:\/\/([a-zA-Z0-9.]{0,255})\/[a-zA-Z0-9_@/-]{0,255}" class="u-url mention">@<span>([a-zA-Z0-9_-]{0,255})<\/span><\/a><\/span>/gmi;
        const pleromaMentionRegex = /<span class="h-card"><a data-user="[a-zA-Z0-9]{0,255}" class="u-url mention" href="https:\/\/([a-zA-Z0-9.]{0,255})\/[a-zA-Z0-9_@/-]{0,255}" rel="ugc">@<span>([a-zA-Z0-9_-]{0,255})<\/span><\/a><\/span>/gmi;

        while (data.match(mastodonMentionRegex)) {
            data = data.replace(mastodonMentionRegex, '@$2@$1');
        }

        while (data.match(pleromaMentionRegex)) {
            data = data.replace(pleromaMentionRegex, '@$2@$1');
        }

        return data;
    }
}
