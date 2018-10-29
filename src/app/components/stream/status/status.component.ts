import { Component, OnInit, Input, Output, Inject, LOCALE_ID, ElementRef, EventEmitter, Pipe, PipeTransform, ViewChild, Renderer2 } from "@angular/core";
import { Status, Account } from "../../../services/models/mastodon.interfaces";
import { formatDate } from '@angular/common';
import { stateNameErrorMessage } from "@ngxs/store/src/decorators/state";
import { StatusWrapper } from "../stream.component";

import { DomSanitizer } from '@angular/platform-browser'

@Component({
    selector: "app-status",
    templateUrl: "./status.component.html",
    styleUrls: ["./status.component.scss"]
})
export class StatusComponent implements OnInit {
    displayedStatus: Status;
    reblog: boolean;
    hasAttachments: boolean;
    replyingToStatus: boolean;

    @Output() browseAccount = new EventEmitter<Account>();
    @Output() browseHashtag = new EventEmitter<string>();
    @Output() browseThread = new EventEmitter<string>();



    private _statusWrapper: StatusWrapper;
    status: Status;
    @Input('statusWrapper')
    set statusWrapper(value: StatusWrapper) {
        this._statusWrapper = value;
        this.status = value.status;

        //TEST
        //this.status.content += '<br/><br/><a href class="test">TEST</a>';


        if (this.status.reblog) {
            this.reblog = true;
            this.displayedStatus = this.status.reblog;
        } else {
            this.displayedStatus = this.status;
        }

        if (!this.displayedStatus.account.display_name) {
            this.displayedStatus.account.display_name = this.displayedStatus.account.username;
        }

        if (this.displayedStatus.media_attachments && this.displayedStatus.media_attachments.length > 0) {
            this.hasAttachments = true;
        }


    }
    get statusWrapper(): StatusWrapper {
        return this._statusWrapper;
    }


    constructor(@Inject(LOCALE_ID) private locale: string) { }

    ngOnInit() {
    }

    // ngAfterViewInit() {
    //     let el = this.contentElement.nativeElement.querySelector('.test');
    //     console.log(this.contentElement.nativeElement);
    //     console.log(el);
    //     if (el)
    //         this.renderer.listen(el, 'click', (el2) => {
    //             console.log(el2);
    //             console.warn('YOOOOO');
    //             return false;
    //         });
    // }

    openAccount(account: Account): boolean {
        this.browseAccount.next(account);
        return false;
    }

    getCompactRelativeTime(d: string): string {
        const date = (new Date(d)).getTime();
        const now = Date.now();
        const timeDelta = (now - date) / (1000);

        if (timeDelta < 60) {
            return `${timeDelta | 0}s`;
        } else if (timeDelta < 60 * 60) {
            return `${timeDelta / 60 | 0}m`;
        } else if (timeDelta < 60 * 60 * 24) {
            return `${timeDelta / (60 * 60) | 0}h`;
        } else if (timeDelta < 60 * 60 * 24 * 31) {
            return `${timeDelta / (60 * 60 * 24) | 0}d`;
        }

        return formatDate(date, 'MM/dd', this.locale);
    }

    openReply(): boolean {
        this.replyingToStatus = !this.replyingToStatus;

        return false;
    }

    closeReply(): boolean {
        this.replyingToStatus = false;
        return false;
    }

    test(): boolean {
        console.warn('heeeeyaaa!');
        return false;
    }
}
