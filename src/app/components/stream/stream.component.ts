import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from "@angular/core";
import { Subject } from "rxjs";

import { StreamElement } from "../../states/streams.state";
import { Status } from "../../services/models/mastodon.interfaces";
import { AccountInfo } from "../../states/accounts.state";

@Component({
    selector: "app-stream",
    templateUrl: "./stream.component.html",
    styleUrls: ["./stream.component.scss"]
})
export class StreamComponent implements OnInit {
    overlayActive: boolean;
    overlayAccountToBrowse: string;
    overlayHashtagToBrowse: string;

    private goToTopSubject: Subject<void> = new Subject<void>();

    @Input() streamElement: StreamElement;

    constructor() { }

    ngOnInit() {
    }

    goToTop(): boolean {
        this.goToTopSubject.next();
        return false;
    }

    browseAccount(account: string): void {
        this.overlayAccountToBrowse = account;
        this.overlayHashtagToBrowse = null;
        this.overlayActive = true;
    }

    browseHashtag(hashtag: string): void {
        this.overlayAccountToBrowse = null;
        this.overlayHashtagToBrowse = hashtag;
        this.overlayActive = true;
    }

    browseThread(thread: string): void {
        console.warn('browseThread');
        console.warn(thread);
    }

    closeOverlay(): void {
        this.overlayAccountToBrowse = null;
        this.overlayActive = false;
    }
}

export class StatusWrapper {
    constructor(
        public status: Status,
        public provider: AccountInfo
    ) { }
}