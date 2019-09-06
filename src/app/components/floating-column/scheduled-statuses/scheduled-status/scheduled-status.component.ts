import { Component, OnInit, Input } from '@angular/core';

import { AccountInfo } from '../../../../states/accounts.state';
import { ScheduledStatus } from '../../../../services/models/mastodon.interfaces';
import { ToolsService } from '../../../../services/tools.service';

@Component({
    selector: 'app-scheduled-status',
    templateUrl: './scheduled-status.component.html',
    styleUrls: ['./scheduled-status.component.scss']
})
export class ScheduledStatusComponent implements OnInit {

    avatar: string;
    @Input() account: AccountInfo;
    @Input() status: ScheduledStatus;

    constructor(private readonly toolsService: ToolsService) { }

    ngOnInit() {
        this.toolsService.getAvatar(this.account)
            .then((avatar: string) => {
                this.avatar = avatar;
            });
    }
}
