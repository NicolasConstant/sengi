import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-stream-notifications',
    templateUrl: './stream-notifications.component.html',
    styleUrls: ['./stream-notifications.component.scss']
})
export class StreamNotificationsComponent implements OnInit {
    displayingAll = true;

    constructor() { }

    ngOnInit() {
    }

    select(value: 'all' | 'mentions'): boolean {
        if(value === 'all'){
            this.displayingAll = true;
        } else {
            this.displayingAll = false;
        }
        return false;
    }
}
