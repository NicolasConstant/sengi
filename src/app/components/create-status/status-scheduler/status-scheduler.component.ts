import { Component, OnInit, Input } from '@angular/core';
import { faCalendarAlt } from "@fortawesome/free-regular-svg-icons";

@Component({
    selector: 'app-status-scheduler',
    templateUrl: './status-scheduler.component.html',
    styleUrls: ['./status-scheduler.component.scss']
})
export class StatusSchedulerComponent implements OnInit {
    faCalendarAlt = faCalendarAlt;
    min = new Date();
    // scheduledDate: string;

    @Input() scheduledDate: string;

    constructor() { }

    ngOnInit() {
    }

    openScheduler(): boolean {
        return false;
    }

    getScheduledDate(): string {
        try {
            return new Date(this.scheduledDate).toISOString();
        } catch(err){
            return null;
        }
    }
}
