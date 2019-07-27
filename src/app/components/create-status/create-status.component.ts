import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { Subscription, Observable } from 'rxjs';
import { UP_ARROW, DOWN_ARROW, ENTER, ESCAPE } from '@angular/cdk/keycodes';
import { faPaperclip, faGlobe, faGlobeAmericas, faLock, faLockOpen, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWindowClose as faWindowCloseRegular } from "@fortawesome/free-regular-svg-icons";
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';

import { MastodonService, VisibilityEnum } from '../../services/mastodon.service';
import { Status, Attachment } from '../../services/models/mastodon.interfaces';
import { ToolsService } from '../../services/tools.service';
import { NotificationService } from '../../services/notification.service';
import { StatusWrapper } from '../../models/common.model';
import { AccountInfo } from '../../states/accounts.state';
import { InstancesInfoService } from '../../services/instances-info.service';
import { MediaService } from '../../services/media.service';
import { AutosuggestSelection, AutosuggestUserActionEnum } from './autosuggest/autosuggest.component';
import { Overlay, OverlayConfig, FullscreenOverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { EmojiPickerComponent } from './emoji-picker/emoji-picker.component';

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

    autoSuggestUserActionsStream = new EventEmitter<AutosuggestUserActionEnum>();

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
        if (value) {
            this.countStatusChar(value);
            this.detectAutosuggestion(value);
            this._status = value;

            setTimeout(() => {
                this.autoGrow();
            }, 0);

        } else {
            this.autosuggestData = null;
        }
    }
    get status(): string {
        return this._status;
    }

    @Input('redraftedStatus')
    set redraftedStatus(value: StatusWrapper) {
        if (value) {
            this.statusLoaded = false;
            let parser = new DOMParser();
            var dom = parser.parseFromString(value.status.content, 'text/html')
            this.status = dom.body.textContent;

            this.setVisibilityFromStatus(value.status);
            this.title = value.status.spoiler_text;
            this.statusLoaded = true;

            if (value.status.in_reply_to_id) {
                this.isSending = true;
                this.mastodonService.getStatus(value.provider, value.status.in_reply_to_id)
                    .then((status: Status) => {
                        this.statusReplyingToWrapper = new StatusWrapper(status, value.provider);

                        const mentions = this.getMentions(this.statusReplyingToWrapper.status, this.statusReplyingToWrapper.provider);
                        for (const mention of mentions) {
                            const name = `@${mention.split('@')[0]}`;
                            if (this.status.includes(name)) {
                                this.status = this.status.replace(name, `@${mention}`);
                            } else {
                                this.status = `@${mention} ` + this.status;
                            }
                        }

                    })
                    .catch(err => {
                        this.notificationService.notifyHttpError(err);
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
    private statusLoaded: boolean;
    private hasSuggestions: boolean;

    @Input() statusReplyingToWrapper: StatusWrapper;
    @Output() onClose = new EventEmitter();
    @ViewChild('reply') replyElement: ElementRef;
    @ViewChild('fileInput') fileInputElement: ElementRef;
    @ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;

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
    // privacyList: string[] = ['Public', 'Unlisted', 'Follows-only', 'DM'];

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;
    private selectedAccount: AccountInfo;

    constructor(
        private readonly contextMenuService: ContextMenuService,
        private readonly store: Store,
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService,
        private readonly instancesInfoService: InstancesInfoService,
        private readonly mediaService: MediaService,
        private readonly overlay: Overlay,
        public viewContainerRef: ViewContainerRef) {
        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
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

            const uniqueMentions = this.getMentions(this.statusReplyingTo, this.statusReplyingToWrapper.provider);
            for (const mention of uniqueMentions) {
                this.status += `@${mention} `;
            }

            this.setVisibilityFromStatus(this.statusReplyingTo);

            this.title = this.statusReplyingTo.spoiler_text;
        } else if (this.replyingUserHandle) {
            this.initMention();
        }

        this.statusLoaded = true;
        this.focus();
    }

    ngOnDestroy() {
        this.accountSub.unsubscribe();
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

        const caretPosition = this.replyElement.nativeElement.selectionStart;
        const word = this.getWordByPos(status, caretPosition);
        if (word && word.length > 0 && (word.startsWith('@') || word.startsWith('#'))) {
            this.autosuggestData = word;
            return;
        }
        this.autosuggestData = null;
    }

    private getWordByPos(str, pos) {
        var left = str.substr(0, pos);
        var right = str.substr(pos);

        left = left.replace(/^.+ /g, "");
        right = right.replace(/ .+$/g, "");

        return left + right;
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

            const settings = this.toolsService.getAccountSettings(this.selectedAccount);
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
                        this.notificationService.notifyHttpError(err);
                    });
            }

            if (!this.statusReplyingToWrapper && !this.replyingUserHandle) {
                this.getDefaultPrivacy();
            }
        }
    }

    private getDefaultPrivacy() {
        this.instancesInfoService.getDefaultPrivacy(this.selectedAccount)
            .then((defaultPrivacy: VisibilityEnum) => {
                this.setVisibility(defaultPrivacy);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
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
    }

    private setVisibility(defaultPrivacy: VisibilityEnum) {
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
        const statusExtraChars = this.getMentionExtraChars(status);

        const statusLength = currentStatus.length - statusExtraChars;
        this.charCountLeft = this.maxCharLength - statusLength - this.getCwLength();
        this.postCounts = parseStatus.length;
    }

    private getCwLength(): number {
        let cwLength = 0;
        if (this.title) {
            cwLength = this.title.length;
        }
        return cwLength;
    }

    private getMentions(status: Status, providerInfo: AccountInfo): string[] {
        const mentions = [status.account.acct, ...status.mentions.map(x => x.acct)];

        let uniqueMentions = [];
        for (let mention of mentions) {
            if (!uniqueMentions.includes(mention)) {
                uniqueMentions.push(mention);
            }
        }

        let globalUniqueMentions = [];
        for (let mention of uniqueMentions) {
            if (!mention.includes('@')) {
                mention += `@${providerInfo.instance}`;
            }
            globalUniqueMentions.push(mention);
        }

        const selectedUser = this.toolsService.getSelectedAccounts()[0];
        globalUniqueMentions = globalUniqueMentions.filter(x => x.toLowerCase() !== `${selectedUser.username}@${selectedUser.instance}`.toLowerCase());

        return globalUniqueMentions;
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

        usableStatus
            .then((status: Status) => {
                return this.sendStatus(acc, this.status, visibility, this.title, status, mediaAttachments);
            })
            .then((res: Status) => {
                this.title = '';
                this.status = '';
                this.onClose.emit();
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isSending = false;
            });

        return false;
    }

    private sendStatus(account: AccountInfo, status: string, visibility: VisibilityEnum, title: string, previousStatus: Status, attachments: Attachment[]): Promise<Status> {
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
                        return this.mastodonService.postNewStatus(account, s, visibility, title, inReplyToId, attachments.map(x => x.id))
                            .then((status: Status) => {
                                this.mediaService.clearMedia();
                                return status;
                            });
                    } else {
                        return this.mastodonService.postNewStatus(account, s, visibility, title, inReplyToId, []);
                    }
                })
                .then((status: Status) => {
                    if (this.statusReplyingToWrapper) {
                        this.notificationService.newStatusPosted(this.statusReplyingToWrapper.status.id, new StatusWrapper(status, account));
                    }

                    return status;
                });
        }

        return resultPromise;
    }

    private parseStatus(status: string): string[] {
        let mentionExtraChars = this.getMentionExtraChars(status);
        let trucatedStatus = `${status}`;
        let results = [];

        let aggregateMention = '';
        let mentions = this.getMentionsFromStatus(status);
        mentions.forEach(x => {
            aggregateMention += `${x} `;
        });

        const currentMaxCharLength = this.maxCharLength + mentionExtraChars - this.getCwLength();
        const maxChars = currentMaxCharLength - 6;

        while (trucatedStatus.length > currentMaxCharLength) {
            const nextIndex = trucatedStatus.lastIndexOf(' ', maxChars);
            results.push(trucatedStatus.substr(0, nextIndex) + ' (...)');
            trucatedStatus = aggregateMention + trucatedStatus.substr(nextIndex + 1);
        }
        results.push(trucatedStatus);
        return results;
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

            let transformedStatus = this.status;
            transformedStatus = transformedStatus.replace(new RegExp(` ${selection.pattern} `), ` ${selection.autosuggest} `).replace('  ', ' ');
            transformedStatus = transformedStatus.replace(new RegExp(`${selection.pattern} `), `${selection.autosuggest} `).replace('  ', ' ');
            transformedStatus = transformedStatus.replace(new RegExp(`${selection.pattern}$`), `${selection.autosuggest} `).replace('  ', ' ');
            this.status = transformedStatus;

            let newCaretPosition = this.status.indexOf(`${selection.autosuggest} `) + selection.autosuggest.length + 1;
            if (newCaretPosition > this.status.length) newCaretPosition = this.status.length;

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
            this.replyElement.nativeElement.style.height = `0px`;
            this.replyElement.nativeElement.style.height = `${this.replyElement.nativeElement.scrollHeight}px`;
        }
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
    openEmojiPicker(e: MouseEvent): boolean {
        console.warn(e);


        let config = new OverlayConfig();
        config.positionStrategy = this.overlay.position()
            .global()
            .left(`${e.pageX}px`)
            .top(`${e.pageY}px`);
        config.hasBackdrop = true;


        this.overlayRef = this.overlay.create(config);
        this.overlayRef.backdropClick().subscribe(() => {
            console.warn('wut?');
            this.overlayRef.dispose();
        });

        // const filePreviewPortal = ;
        //overlayRef.attach(new ComponentPortal(EmojiPickerComponent, this.viewContainerRef));
        // overlayRef.attach(new ComponentPortal(EmojiPickerComponent));

        
        let comp = new ComponentPortal(EmojiPickerComponent);       
        //this.overlayRef.attach(comp);

        const compRef: ComponentRef<EmojiPickerComponent> = this.overlayRef.attach(comp);
        compRef.instance.closedEvent.subscribe(() => {
            this.overlayRef.dispose();
        })


        // overlayRef.backdropClick().subscribe(() => {
        //     console.warn('wut?');
        //     overlayRef.dispose();
        // });

        return false;
    }

    closeEmoji(): boolean {
        this.overlayRef.dispose();
        return false;
    }
}
