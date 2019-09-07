import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

import { ToolsService } from '../../../services/tools.service';
import { MastodonService } from '../../../services/mastodon.service';
import { NotificationService } from '../../../services/notification.service';
import { Results, Account } from '../../../services/models/mastodon.interfaces';
import { Actions } from '@ngxs/store';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-autosuggest',
    templateUrl: './autosuggest.component.html',
    styleUrls: ['./autosuggest.component.scss']
})
export class AutosuggestComponent implements OnInit, OnDestroy {

    private lastPatternUsed: string;
    private lastPatternUsedWtType: string;
    accounts: SelectableAccount[] = [];
    hashtags: SelectableHashtag[] = [];

    @Output() suggestionSelectedEvent = new EventEmitter<AutosuggestSelection>();
    @Output() hasSuggestionsEvent = new EventEmitter<boolean>();

    private _pattern: string;
    @Input('pattern')
    set pattern(value: string) {
        if (value) {
            this._pattern = value;
            this.analysePattern(value);
        } else {
            this.accounts.length = 0;
            this.hashtags.length = 0;
        }
    }
    get pattern(): string {
        return this._pattern;
    }

    @Input() autoSuggestUserActionsStream: EventEmitter<AutosuggestUserActionEnum>;
    private autoSuggestUserActionsSub: Subscription;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        if (this.autoSuggestUserActionsStream) {
            this.autoSuggestUserActionsSub = this.autoSuggestUserActionsStream.subscribe((action: AutosuggestUserActionEnum) => {
                this.processUserInput(action);
            });
        }
    }

    ngOnDestroy(): void {
        if (this.autoSuggestUserActionsSub) this.autoSuggestUserActionsSub.unsubscribe();
    }

    private analysePattern(value: string) {
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];
        const isAccount = value[0] === '@';
        const pattern = value.substring(1);
        this.lastPatternUsed = pattern;
        this.lastPatternUsedWtType = value;

        this.mastodonService.search(selectedAccount, pattern, false)
            .then((results: Results) => {
                if (this.lastPatternUsed !== pattern) return;

                this.accounts.length = 0;
                this.hashtags.length = 0;

                if (isAccount) {
                    for (let account of results.accounts) {
                        //if (account.acct != this.lastPatternUsed) {
                            this.accounts.push(new SelectableAccount(account));
                            this.accounts[0].selected = true;
                            if (this.accounts.length > 7) return;
                        //}
                    }
                }
                else {
                    for (let hashtag of results.hashtags) {
                        //if (hashtag !== this.lastPatternUsed) {
                        //if (hashtag.includes(this.lastPatternUsed.toLocaleLowerCase()) && hashtag !== this.lastPatternUsed) {
                        //if (hashtag.includes(this.lastPatternUsed) && hashtag !== this.lastPatternUsed) {
                            this.hashtags.push(new SelectableHashtag(hashtag));
                            this.hashtags[0].selected = true;
                            if (this.hashtags.length > 7) return;
                        //}
                    }
                }
            })
            .then(() => {
                if (this.hashtags.length > 0 || this.accounts.length > 0) {
                    this.hasSuggestionsEvent.next(true);
                } else {
                    this.hasSuggestionsEvent.next(false);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, selectedAccount);
            });
    }

    private processUserInput(action: AutosuggestUserActionEnum) {
        const isAutosuggestingHashtag = this.hashtags.length > 0;

        switch (action) {
            case AutosuggestUserActionEnum.Validate:
                if (isAutosuggestingHashtag) {
                    let selection = this.hashtags.find(x => x.selected);
                    this.hashtagSelected(selection);
                } else {
                    let selection = this.accounts.find(x => x.selected);
                    this.accountSelected(selection);
                }
                break;
            case AutosuggestUserActionEnum.MoveDown:
                if (isAutosuggestingHashtag) {
                    let selectionIndex = this.hashtags.findIndex(x => x.selected);
                    if (selectionIndex < (this.hashtags.length - 1)) {
                        this.hashtags[selectionIndex].selected = false;
                        this.hashtags[selectionIndex + 1].selected = true;
                    }
                } else {
                    let selectionIndex = this.accounts.findIndex(x => x.selected);
                    if (selectionIndex < (this.accounts.length - 1)) {
                        this.accounts[selectionIndex].selected = false;
                        this.accounts[selectionIndex + 1].selected = true;
                    }
                }
                break;
            case AutosuggestUserActionEnum.MoveUp:
                if (isAutosuggestingHashtag) {
                    let selectionIndex = this.hashtags.findIndex(x => x.selected);
                    if (selectionIndex > 0) {
                        this.hashtags[selectionIndex].selected = false;
                        this.hashtags[selectionIndex - 1].selected = true;
                    }
                } else {
                    let selectionIndex = this.accounts.findIndex(x => x.selected);
                    if (selectionIndex > 0) {
                        this.accounts[selectionIndex].selected = false;
                        this.accounts[selectionIndex - 1].selected = true;
                    }
                }
                break;
        }
    }

    accountSelected(selAccount: SelectableAccount): boolean {
        const fullHandle = this.toolsService.getAccountFullHandle(selAccount.account);
        this.suggestionSelectedEvent.next(new AutosuggestSelection(this.lastPatternUsedWtType, fullHandle));
        return false;
    }

    hashtagSelected(selHashtag: SelectableHashtag): boolean {
        this.suggestionSelectedEvent.next(new AutosuggestSelection(this.lastPatternUsedWtType, `#${selHashtag.hashtag}`));
        return false;
    }
}

class SelectableAccount {
    constructor(public account: Account, public selected: boolean = false) {
    }
}

class SelectableHashtag {
    constructor(public hashtag: string, public selected: boolean = false) {
    }
}

export class AutosuggestSelection {
    constructor(public pattern: string, public autosuggest: string) {
    }
}

export enum AutosuggestUserActionEnum {
    MoveDown,
    MoveUp,
    Validate
}
