import { Component, Input } from '@angular/core';
import { faUserPlus, faUserClock, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

import { NotificationWrapper } from '../notifications.component';
import { ToolsService } from '../../../../../services/tools.service';
import { Account } from '../../../../../services/models/mastodon.interfaces';
import { BrowseBase } from '../../../../../components/common/browse-base';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent extends BrowseBase {  
    faUserPlus = faUserPlus;
    faUserClock = faUserClock;
    faCheck = faCheck;
    faTimes = faTimes;

    @Input() notification: NotificationWrapper;

    constructor(private readonly toolsService: ToolsService) { 
        super();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    openAccount(account: Account): boolean {
        let accountName = this.toolsService.getAccountFullHandle(account);
        this.browseAccountEvent.next(accountName);
        return false;
    }
    
    openUrl(url: string): boolean {
        window.open(url, '_blank');
        return false;
    }

    acceptFollowRequest(): boolean{

        return false;
    }

    refuseFollowRequest(): boolean{

        return false;
    }
}
