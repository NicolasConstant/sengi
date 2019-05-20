import { Component, OnInit, Input } from '@angular/core';

import { StreamWrapper } from '../my-account.component';
import { MastodonService } from '../../../../../services/mastodon.service';
import { AccountWrapper } from '../../../../../models/account.models';
import { NotificationService } from '../../../../../services/notification.service';
import { Account } from "../../../../../services/models/mastodon.interfaces";

@Component({
    selector: 'app-list-editor',
    templateUrl: './list-editor.component.html',
    styleUrls: ['./list-editor.component.scss']
})
export class ListEditorComponent implements OnInit {

    @Input() list: StreamWrapper;
    @Input() account: AccountWrapper;

    accountsInList: Account[] = [];

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        console.log(this.list);
        console.log(this.account);
        this.accountsInList.length = 0;
        this.mastodonService.getListAccounts(this.account.info, this.list.listId)
            .then((accounts: Account[]) => {
                this.accountsInList = accounts;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });
    }

}
