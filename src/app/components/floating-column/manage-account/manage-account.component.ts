import { Component, OnInit, Input } from '@angular/core';
import { StreamElement, StreamTypeEnum, AddStream, RemoveAllStreams } from '../../../states/streams.state';
import { Store } from '@ngxs/store';
import { AccountsStateModel, AccountInfo, RemoveAccount } from '../../../states/accounts.state';
import { AccountWrapper } from '../../../models/account.models';
import { NavigationService } from '../../../services/navigation.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-manage-account',
    templateUrl: './manage-account.component.html',
    styleUrls: ['./manage-account.component.scss']
})
export class ManageAccountComponent implements OnInit {
    @Input() account: AccountWrapper;

    availableStreams: StreamElement[] = [];

    constructor(
        private readonly store: Store,
        private readonly navigationService: NavigationService,
        private notificationService: NotificationService) { }

    ngOnInit() {
        const instance = this.account.info.instance;
        this.availableStreams.length = 0;
        this.availableStreams.push(new StreamElement(StreamTypeEnum.global, 'Federated Timeline', this.account.info.id, null, null, `federate@${instance}`));
        this.availableStreams.push(new StreamElement(StreamTypeEnum.local, 'Local Timeline', this.account.info.id, null, null, `local@${instance}`));
        this.availableStreams.push(new StreamElement(StreamTypeEnum.personnal, 'Home', this.account.info.id, null, null, `home@${instance}`));
    }

    addStream(stream: StreamElement): boolean {
        if (stream) {
            this.store.dispatch([new AddStream(stream)]).toPromise()
                .then(() => {
                    this.notificationService.notify(`${stream.displayableFullName} added`, false);
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
