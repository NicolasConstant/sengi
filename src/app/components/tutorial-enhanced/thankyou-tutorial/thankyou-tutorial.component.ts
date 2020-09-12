import { Component, OnInit } from '@angular/core';

import { ToolsService } from '../../../services/tools.service';
import { MastodonWrapperService } from '../../../services/mastodon-wrapper.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-thankyou-tutorial',
    templateUrl: './thankyou-tutorial.component.html',
    styleUrls: ['../tutorial-enhanced.component.scss', './thankyou-tutorial.component.scss']
})
export class ThankyouTutorialComponent implements OnInit {
    followingDisabled: boolean;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
    }

    follow(): boolean {
        if(this.followingDisabled) return;
        this.followingDisabled = true;        

        const accounts = this.toolsService.getAllAccounts();
        for (let acc of accounts) {
            this.toolsService.findAccount(acc, "@sengi_app@mastodon.social")
                .then(sengi => {
                    return this.mastodonService.follow(acc, sengi);
                })
                .catch(err => {
                    this.followingDisabled = false;
                    this.notificationService.notifyHttpError(err, acc);
                });
        }

        return false;
    }
}
