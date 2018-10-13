import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountInfo } from '../../../states/accounts.state';
import { MastodonService, VisibilityEnum } from '../../../services/mastodon.service';
import { Status } from '../../../services/models/mastodon.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-new-status',
    templateUrl: './add-new-status.component.html',
    styleUrls: ['./add-new-status.component.scss']
})
export class AddNewStatusComponent implements OnInit {
    @Input() title: string;
    @Input() status: string;

    selectedPrivacy = 'Public';
    privacyList: string[] = ['Public', 'Unlisted', 'Follows-only', 'DM'];

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    onSubmit(): boolean {
        const accounts = this.getRegisteredAccounts();
        const selectedAccounts = accounts.filter(x => x.isSelected);

        console.warn(`selectedAccounts ${selectedAccounts.length}`);
        console.warn(`statusHandle ${this.status}`);

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

        let spoiler = this.title;
        if(spoiler === '') {
            spoiler = null;
        }

        for (const acc of selectedAccounts) {
            this.mastodonService.postNewStatus(acc, this.status, visibility, spoiler)
                .then((res: Status) => {
                    console.log(res);
                    this.title = '';
                    this.status = '';
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
