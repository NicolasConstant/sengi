import { Component, OnInit, Input } from '@angular/core';

import { ToolsService } from '../../../services/tools.service';
import { MastodonService } from '../../../services/mastodon.service';
import { NotificationService } from '../../../services/notification.service';
import { Results, Account } from '../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-autosuggest',
    templateUrl: './autosuggest.component.html',
    styleUrls: ['./autosuggest.component.scss']
})
export class AutosuggestComponent implements OnInit {
    accounts: Account[] = [];
    hashtags: string[] = [];

    private _pattern: string;
    @Input('pattern')
    set pattern(value: string) {
        this._pattern = value;
        this.analysePattern(value);
    }
    get pattern(): string {
        return this._pattern;
    }

    constructor(
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    private lastPatternUsed: string;
    private analysePattern(value: string) {
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];
        const isAccount = value[0] === '@';
        const pattern = value.substring(1);
        this.lastPatternUsed = pattern;

        this.mastodonService.search(selectedAccount, pattern, false)
            .then((results: Results) => {
                if(this.lastPatternUsed !== pattern) return;

                this.accounts.length = 0;
                this.hashtags.length = 0;

                if (isAccount) {
                    for (let account of results.accounts) {
                        this.accounts.push(account);
                    }
                }
                else {
                    for (let hashtag of results.hashtags) {
                        if (hashtag.includes(this.lastPatternUsed) || hashtag === this.lastPatternUsed) {
                            this.hashtags.push(hashtag);
                        }
                    }
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });
    }
}
