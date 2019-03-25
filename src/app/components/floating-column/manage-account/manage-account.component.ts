import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { faAt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { faBell, faEnvelope, faUser, faStar } from "@fortawesome/free-regular-svg-icons";
import { Subscription } from 'rxjs';

import { AccountWrapper } from '../../../models/account.models';
import { UserNotificationServiceService, UserNotification } from '../../../services/user-notification-service.service';


@Component({
    selector: 'app-manage-account',
    templateUrl: './manage-account.component.html',
    styleUrls: ['./manage-account.component.scss']
})
export class ManageAccountComponent implements OnInit, OnDestroy {   
    faAt = faAt;
    faBell = faBell;
    faEnvelope = faEnvelope;
    faUser = faUser;
    faStar = faStar;
    faUserPlus = faUserPlus;

    subPanel = 'account';
    hasNotifications = false;
    hasMentions = false;

    @Input('account')
    set account(acc: AccountWrapper) {
        this._account = acc;
        this.checkNotifications();
    }
    get account(): AccountWrapper {
        return this._account;
    }

    private userNotificationServiceSub: Subscription;
    private _account: AccountWrapper;

    constructor(
        private readonly userNotificationService: UserNotificationServiceService) { }

    ngOnInit() {
      
    }

    ngOnDestroy(): void {
        this.userNotificationServiceSub.unsubscribe();
    }

    private checkNotifications(){
        if(this.userNotificationServiceSub){
            this.userNotificationServiceSub.unsubscribe();
        }

        this.userNotificationServiceSub = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {
            const userNotification = userNotifications.find(x => x.account.id === this.account.info.id);
            if(userNotification){
                this.hasNotifications = userNotification.hasNewNotifications;
                this.hasMentions = userNotification.hasNewMentions;
            }
        });
    }

    loadSubPanel(subpanel: string): boolean {
        this.subPanel = subpanel;
        return false;
    }
}
