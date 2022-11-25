import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { AccountWrapper } from '../../../models/account.models';
import { Account } from "../../../services/models/mastodon.interfaces";
import { AccountWithNotificationWrapper } from '../left-side-bar.component';
import { ToolsService } from '../../../services/tools.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-account-icon',
    templateUrl: './account-icon.component.html',
    styleUrls: ['./account-icon.component.scss']
})
export class AccountIconComponent implements OnInit {
    @Input() account: AccountWithNotificationWrapper;
    @Output() toggleAccountNotify = new EventEmitter<AccountWrapper>();
    @Output() openMenuNotify = new EventEmitter<AccountWrapper>();

    private promiseGetUser: Promise<Account>;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonTools: ToolsService) { }

    ngOnInit() {
        this.promiseGetUser = this.mastodonTools.findAccount(this.account.info, `@${this.account.info.username}@${this.account.info.instance}`);
    }

    toggleAccount(): boolean {
        this.toggleAccountNotify.emit(this.account);
        return false;
    }

    openMenu(): boolean {
        this.openMenuNotify.emit(this.account);
        return false;
    }

    openLocalAccount(e): boolean {
        e.preventDefault();

        if (e.which == 2) {
            this.promiseGetUser
                .then((account: Account) => {
                    window.open(account.url, '_blank');
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err, null);
                });
            return false;
        }
    }
}
