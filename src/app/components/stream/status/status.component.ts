import { Component, OnInit, Input, Inject, LOCALE_ID } from "@angular/core";
import { Status } from "../../../services/models/mastodon.interfaces";
import { formatDate } from '@angular/common';


@Component({
    selector: "app-status",
    templateUrl: "./status.component.html",
    styleUrls: ["./status.component.scss"]
})
export class StatusComponent implements OnInit {
    @Input() status: Status;

    constructor(@Inject(LOCALE_ID) private locale: string) { }

    ngOnInit() {
    }

    getCompactRelativeTime(d: string): string {
        const date = (new Date(d)).getTime();
        const now = Date.now();
        const timeDelta = (now - date) / (1000);

        if (timeDelta < 60) {
            return `${timeDelta | 0}s`;
        }
        if (timeDelta < 60 * 60) {
            return `${timeDelta / 60 | 0}m`;
        } else if (timeDelta < 60 * 60 * 24) {
            return `${timeDelta / (60 * 60)| 0}h`;
        } else if (timeDelta < 60 * 60 * 24 * 31) {
            return `${timeDelta / (60 * 60 * 24) | 0}d`;
        }
       
        return formatDate(date, 'MM/dd', this.locale);
    }
}
