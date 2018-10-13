import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngxs/store';
import { MastodonService, VisibilityEnum } from '../../../../services/mastodon.service';
import { AccountInfo } from '../../../../states/accounts.state';
import { StatusWrapper } from '../../stream.component';
import { Status } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-reply-to-status',
    templateUrl: './reply-to-status.component.html',
    styleUrls: ['./reply-to-status.component.scss']
})
export class ReplyToStatusComponent implements OnInit {
    @Input() status: string = '';
    @Input() statusReplyingToWrapper: StatusWrapper;
    @Output() onClose = new EventEmitter();

    private statusReplyingTo: Status;

    selectedPrivacy = 'Public';
    privacyList: string[] = ['Public', 'Unlisted', 'Follows-only', 'DM'];

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        this.statusReplyingTo = this.statusReplyingToWrapper.status;

        this.status += `@${this.statusReplyingTo.account.acct} `;
        for (const mention of this.statusReplyingTo.mentions) {
            this.status += `@${mention.acct} `;
        }
    }

    onSubmit(): boolean {
        const accounts = this.getRegisteredAccounts();
        const selectedAccounts = accounts.filter(x => x.isSelected);

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

        let spoiler =  this.statusReplyingTo.spoiler_text;

        for (const acc of selectedAccounts) {
            this.mastodonService.postNewStatus(acc, this.status, visibility, spoiler, this.statusReplyingTo.id)
                .then((res: Status) => {
                    console.log(res);
                    this.status = '';
                    this.onClose.emit();
                });
        }

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
