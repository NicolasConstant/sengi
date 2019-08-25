import { Component, OnInit, Input } from '@angular/core';

import { AccountInfo } from '../../../../states/accounts.state';
import { ScheduledStatus } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-scheduled-status',
    templateUrl: './scheduled-status.component.html',
    styleUrls: ['./scheduled-status.component.scss']
})
export class ScheduledStatusComponent implements OnInit {

    @Input() account: AccountInfo;
    @Input() status: ScheduledStatus;

    constructor() { }

    ngOnInit() {
    }

}
