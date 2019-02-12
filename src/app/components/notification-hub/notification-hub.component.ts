import { Component, OnInit } from '@angular/core';
import { NotificationService, NotificatioData } from '../../services/notification.service';

@Component({
    selector: 'app-notification-hub',
    templateUrl: './notification-hub.component.html',
    styleUrls: ['./notification-hub.component.scss']
})
export class NotificationHubComponent implements OnInit {
    notifications: NotificatioData[] = [];

    constructor(private notificationService: NotificationService) { }

    ngOnInit() {
        this.notificationService.notifactionStream.subscribe((notification: NotificatioData) => {
            this.notifications.push(notification);

            setTimeout(() => {
                this.notifications = this.notifications.filter(x => x.id !== notification.id);
            }, 2000);
        });

        //this.autoSubmit();       
    }
    
    autoSubmit(): any {
        this.notificationService.notify("test message", true);

        setTimeout(() => {
            this.autoSubmit();
        }, 1500);
    }

    onClick(notification: NotificatioData): void{
        this.notifications = this.notifications.filter(x => x.id !== notification.id);
    }
}
