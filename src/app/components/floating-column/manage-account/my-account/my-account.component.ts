import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { NotificationService } from '../../../../services/notification.service';
import { StreamElement, StreamTypeEnum, AddStream, RemoveAllStreams } from '../../../../states/streams.state';
import { AccountWrapper } from '../../../../models/account.models';
import { RemoveAccount } from '../../../../states/accounts.state';
import { NavigationService } from '../../../../services/navigation.service';

@Component({
    selector: 'app-my-account',
    templateUrl: './my-account.component.html',
    styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
    
    availableStreams: StreamElement[] = [];

    @Input() account: AccountWrapper;

    constructor(
        private readonly store: Store,
        private readonly navigationService: NavigationService,
        private notificationService: NotificationService) { }

    ngOnInit() {
        const instance = this.account.info.instance;
        this.availableStreams.length = 0;
        this.availableStreams.push(new StreamElement(StreamTypeEnum.global, 'Federated Timeline', this.account.info.id, null, null, instance));
        this.availableStreams.push(new StreamElement(StreamTypeEnum.local, 'Local Timeline', this.account.info.id, null, null, instance));
        this.availableStreams.push(new StreamElement(StreamTypeEnum.personnal, 'Home', this.account.info.id, null, null, instance));
    }

    addStream(stream: StreamElement): boolean {
        if (stream) {
            this.store.dispatch([new AddStream(stream)]).toPromise()
                .then(() => {
                    this.notificationService.notify(`stream added`, false);
                });
        }
        return false;
    }

    removeAccount(): boolean {
        const accountId = this.account.info.id;
        this.store.dispatch([new RemoveAllStreams(accountId), new RemoveAccount(accountId)]);
        this.navigationService.closePanel();
        return false;
    }
}
