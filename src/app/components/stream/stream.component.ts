import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { faHome, faGlobe, faUser, faHashtag, faListUl, faBars, IconDefinition, faBell } from "@fortawesome/free-solid-svg-icons";

import { StreamElement, StreamTypeEnum } from "../../states/streams.state";
import { OpenThreadEvent, ToolsService } from "../../services/tools.service";
import { StreamStatusesComponent } from './stream-statuses/stream-statuses.component';
import { StreamNotificationsComponent } from './stream-notifications/stream-notifications.component';
import { TimeLineHeaderEnum } from '../../states/settings.state';
import { AccountInfo } from '../../states/accounts.state';
import { SettingsService } from '../../services/settings.service';

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
    overlayThreadToBrowse: OpenThreadEvent;

    timelineHeader: TimeLineHeaderEnum;
    account: AccountInfo;
    avatar: string;

    displayingNotifications: boolean;

    goToTopSubject: Subject<void> = new Subject<void>();

    private _streamElement: StreamElement;

    @ViewChild(StreamStatusesComponent) private streamStatusesComponent: StreamStatusesComponent;
    @ViewChild(StreamNotificationsComponent) private streamNotificationsComponent: StreamNotificationsComponent;

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
            case StreamTypeEnum.activity:
                this.columnFaIcon = faBell;
                this.displayingNotifications = true;
                break;
        }

        this._streamElement = stream;
        this.account = this.toolsService.getAccountById(stream.accountId);
        this.toolsService.getAvatar(this.account)
            .then(a => {
                this.avatar = a;
            })
            .catch(err => { });
    }
    get streamElement(): StreamElement {
        return this._streamElement;
    }

    constructor(
        private readonly settingsService: SettingsService,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
        let settings = this.settingsService.getSettings();
        this.timelineHeader = settings.timelineHeader;
    }

    focus(): boolean {
        if (this.overlayActive) return false;

        if (!this.displayingNotifications) {
            this.streamStatusesComponent.focus();
        } else {
            this.streamNotificationsComponent.focus();
        }
        return false;
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

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.overlayAccountToBrowse = null;
        this.overlayHashtagToBrowse = null;
        this.overlayThreadToBrowse = openThreadEvent;
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
        this.editionPanelIsOpen = !this.editionPanelIsOpen;
        return false;
    }

    streamEditionClosed(): boolean {
        this.editionPanelIsOpen = false;
        return false;
    }
}

