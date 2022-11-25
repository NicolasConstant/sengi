import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificationData } from '../../services/notification.service';

@Component({
    selector: 'app-notification-hub',
    templateUrl: './notification-hub.component.html',
    styleUrls: ['./notification-hub.component.scss']
})
export class NotificationHubComponent implements OnInit {
    notifications: NotificationWrapper[] = [];

    constructor(private notificationService: NotificationService) { }

    ngOnInit() {
        this.notificationService.notificationStream.subscribe((notification: NotificationData) => {
            let alreadyExistingNotification = this.notifications.find(x => x.avatar === notification.avatar && x.message === notification.message);

            if(alreadyExistingNotification){
                alreadyExistingNotification.count++;
            } else{
                this.notifications.push(new NotificationWrapper(notification));
                if(this.notifications.length > 3){
                    this.notifications.length = 3;
                }
    
                setTimeout(() => {
                    this.notifications = this.notifications.filter(x => x.id !== notification.id);
                }, 5000);
            }
        });

        //this.autoSubmit();       
    }
    
    // autoSubmit(): any {
    //     //this.notificationService.notify("test message", true);

    //     setTimeout(() => {
    //         this.autoSubmit();
    //     }, 1500);
    // }

    onClick(notification: NotificationData): void{
        this.notifications = this.notifications.filter(x => x.id !== notification.id);
    }
}

class NotificationWrapper extends NotificationData {
    constructor(data: NotificationData) {
        super(data.avatar, data.errorCode, data.message, data.isError);        
    }

    count = 1;
}