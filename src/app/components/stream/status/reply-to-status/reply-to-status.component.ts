import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { MastodonService } from '../../../../services/mastodon.service';
import { AccountInfo } from '../../../../states/accounts.state';

@Component({
    selector: 'app-reply-to-status',
    templateUrl: './reply-to-status.component.html',
    styleUrls: ['./reply-to-status.component.scss']
})
export class ReplyToStatusComponent implements OnInit {
    @Input() status: string;

    selectedPrivacy = 'Public';
    privacyList: string[] = ['Public', 'Unlisted', 'Follows-only', 'DM'];

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    onSubmit(): boolean {

        return false;
    }

    private getRegisteredAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }

    onCtrlEnter(): boolean {
        this.onSubmit();
        return false;
    }
}
