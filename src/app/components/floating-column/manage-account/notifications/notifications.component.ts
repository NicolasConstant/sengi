import { Component, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { faStar, faUserPlus, faRetweet } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStar2 } from "@fortawesome/free-regular-svg-icons";

import { AccountWrapper } from '../../../../models/account.models';
import { UserNotificationService, UserNotification } from '../../../../services/user-notification.service';
import { StatusWrapper } from '../../../../models/common.model';
import { Status, Notification, Account } from '../../../../services/models/mastodon.interfaces';
import { MastodonService } from '../../../../services/mastodon.service';
import { NotificationService } from '../../../../services/notification.service';
import { AccountInfo } from '../../../../states/accounts.state';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
    faUserPlus = faUserPlus;
    faStar = faStar;
    faRetweet = faRetweet;

    notifications: NotificationWrapper[] = [];
    isLoading = false;

    @Input('account')
    set account(acc: AccountWrapper) {
        this._account = acc;
        this.loadNotifications();
    }
    get account(): AccountWrapper {
        return this._account;
    }
        
    @ViewChild('statusstream') public statustream: ElementRef;

    private maxReached = false;
    private _account: AccountWrapper;
    private userNotificationServiceSub: Subscription;
    private lastId: string;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly userNotificationService: UserNotificationService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        if(this.userNotificationServiceSub){
            this.userNotificationServiceSub.unsubscribe();
        }
    }

    private loadNotifications(){
        if(this.userNotificationServiceSub){
            this.userNotificationServiceSub.unsubscribe();
        }

        this.notifications.length = 0;
        this.userNotificationService.markNotificationAsRead(this.account.info);    

        this.userNotificationServiceSub = this.userNotificationService.userNotifications.subscribe((userNotifications: UserNotification[]) => {
            this.notifications.length = 0; //TODO: don't reset, only add the new ones
            const userNotification = userNotifications.find(x => x.account.id === this.account.info.id);
            if(userNotification && userNotification.notifications){
                userNotification.notifications.forEach((notification: Notification) => {
                    const notificationWrapper = new NotificationWrapper(notification, this.account.info);
                    this.notifications.push(notificationWrapper);
                }); 
            }
            this.lastId = userNotification.lastId;
            this.userNotificationService.markNotificationAsRead(this.account.info);
        });
    }

    
    onScroll() {
        var element = this.statustream.nativeElement as HTMLElement;
        const atBottom = element.scrollHeight <= element.clientHeight + element.scrollTop + 1000;

        if (atBottom) {
            this.scrolledToBottom();
        }
    }

    private scrolledToBottom() {
        if (this.isLoading || this.maxReached || this.notifications.length === 0) return;

        this.isLoading = true;

        this.mastodonService.getNotifications(this.account.info, ['mention'], this.lastId)
            .then((notifications: Notification[]) => {
                if (notifications.length === 0) {
                    this.maxReached = true;
                    return;
                }
                
                for (const s of notifications) {
                    const wrapper = new NotificationWrapper(s, this.account.info);
                    this.notifications.push(wrapper);
                }

                this.lastId = notifications[notifications.length - 1].id;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isLoading = false;
            });
    }

}

class NotificationWrapper {
    constructor(notification: Notification,  provider: AccountInfo) {
        this.type = notification.type;
        switch(this.type){            
            case 'mention': 
            case 'reblog': 
            case 'favourite':
                this.status= new StatusWrapper(notification.status, provider);
                break;          
        }    
        this.account = notification.account;  
    }

    account: Account;
    status: StatusWrapper;
    type: 'mention' | 'reblog' | 'favourite' | 'follow';
}