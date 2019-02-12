import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { HttpErrorResponse } from '@angular/common/http';

import { AccountInfo } from '../../../states/accounts.state';
import { MastodonService, VisibilityEnum } from '../../../services/mastodon.service';
import { Status } from '../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-add-new-status',
    templateUrl: './add-new-status.component.html',
    styleUrls: ['./add-new-status.component.scss']
})
export class AddNewStatusComponent implements OnInit {
    @Input() title: string;
    @Input() status: string;
    @ViewChild('reply') replyElement: ElementRef;

    selectedPrivacy = 'Public';
    privacyList: string[] = ['Public', 'Unlisted', 'Follows-only', 'DM'];

    constructor(
        private readonly store: Store,
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        setTimeout(() => { 
            this.replyElement.nativeElement.focus();
        }, 0);
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

        let spoiler = this.title;
        if(spoiler === '') {
            spoiler = null;
        }

        for (const acc of selectedAccounts) {
            this.mastodonService.postNewStatus(acc, this.status, visibility, spoiler)
                .then((res: Status) => {
                    this.title = '';
                    this.status = '';
                })
                .catch((err: HttpErrorResponse) => {
                    this.notificationService.notifyHttpError(err);
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
