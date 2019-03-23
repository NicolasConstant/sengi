import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { StatusWrapper } from '../../../../models/common.model';
import { OpenThreadEvent } from '../../../../services/tools.service';
import { AccountWrapper } from '../../../../models/account.models';
import { MastodonService } from '../../../../services/mastodon.service';
import { Status } from '../../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../../services/notification.service';

@Component({
    selector: 'app-favorites',
    templateUrl: '../../../stream/stream-statuses/stream-statuses.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
    statuses: StatusWrapper[] = [];
    displayError: string;
    isLoading = true; 
    isThread = false;
    hasContentWarnings = false;

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    @Input() account: AccountWrapper;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        this.getFavorites();
    }

    private getFavorites(){
        this.isLoading = true;
        this.statuses.length = 0;

        this.mastodonService.getFavorites(this.account.info)
            .then((statuses: Status[]) => {

                for (const s of statuses) {
                    const wrapper = new StatusWrapper(s, this.account.info);
                    this.statuses.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isLoading = false;
            });

    }

}
