import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from "@angular/core";
import { Subject } from "rxjs";
import { faHome, faGlobe, faUser, faHashtag, faListUl, faBars, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { StreamElement, StreamTypeEnum } from "../../states/streams.state";
import { Status } from "../../services/models/mastodon.interfaces";
import { AccountInfo } from "../../states/accounts.state";

@Component({
    selector: "app-stream",
    templateUrl: "./stream.component.html",
    styleUrls: ["./stream.component.scss"]
})
export class StreamComponent implements OnInit {
    columnFaIcon: IconDefinition;
    menuFaIcon = faBars;

    overlayActive: boolean;
    overlayAccountToBrowse: string;
    overlayHashtagToBrowse: string;
    overlayThreadToBrowse: string;

    goToTopSubject: Subject<void> = new Subject<void>();

    private _streamElement: StreamElement;

    @Input('streamElement')
    set streamElement(stream: StreamElement) {
        switch (stream.type) {
            case StreamTypeEnum.personnal:
                this.columnFaIcon = faHome;
                break;
            case StreamTypeEnum.global:
                this.columnFaIcon = faGlobe;
                break;
            case StreamTypeEnum.local:
                this.columnFaIcon = faUser;
                break;
            case StreamTypeEnum.tag:
                this.columnFaIcon = faHashtag;
                break;
            case StreamTypeEnum.list:
                this.columnFaIcon = faListUl;
                break;
        }

        this._streamElement = stream;
    }
    get streamElement(): StreamElement {
        return this._streamElement;
    }


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
        this.overlayThreadToBrowse = null;
        this.overlayActive = true;
    }

    browseHashtag(hashtag: string): void {
        this.overlayAccountToBrowse = null;
        this.overlayHashtagToBrowse = hashtag;
        this.overlayThreadToBrowse = null;
        this.overlayActive = true;
    }

    browseThread(statusUri: string): void {
        this.overlayAccountToBrowse = null;
        this.overlayHashtagToBrowse = null;
        this.overlayThreadToBrowse = statusUri;
        this.overlayActive = true;
    }

    closeOverlay(): void {
        this.overlayAccountToBrowse = null;
        this.overlayHashtagToBrowse = null;
        this.overlayThreadToBrowse = null;
        this.overlayActive = false;
    }

    editionPanelIsOpen: boolean;
    openEditionMenu(): boolean {
        console.log('opened menu');
        this.editionPanelIsOpen = !this.editionPanelIsOpen;
        return false;
    }
}

export class StatusWrapper {
    constructor(
        public status: Status,
        public provider: AccountInfo
    ) { }
}