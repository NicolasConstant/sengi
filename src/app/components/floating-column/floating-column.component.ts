import { Component, OnInit, OnDestroy } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { NavigationService, LeftPanelType } from '../../services/navigation.service';
import { AccountWrapper } from '../../models/account.models';
import { OpenThreadEvent } from '../../services/tools.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-floating-column',
    templateUrl: './floating-column.component.html',
    styleUrls: ['./floating-column.component.scss']
})
export class FloatingColumnComponent implements OnInit, OnDestroy {
   
    faTimes = faTimes;
    overlayActive: boolean;
    overlayAccountToBrowse: string;
    overlayHashtagToBrowse: string;
    overlayThreadToBrowse: OpenThreadEvent;

    userAccountUsed: AccountWrapper;

    openPanel: string = '';

    private activatedPanelSub: Subscription;

    constructor(private readonly navigationService: NavigationService) { }

    ngOnInit() {
        this.activatedPanelSub = this.navigationService.activatedPanelSubject.subscribe((type: LeftPanelType) => {
            this.overlayActive = false;
            switch (type) {
                case LeftPanelType.Closed:
                    this.openPanel = '';
                    break;
                case LeftPanelType.AddNewAccount:
                    if (this.openPanel === 'addNewAccount') {
                        this.closePanel();
                    } else {
                        this.openPanel = 'addNewAccount';
                    }
                    break;
                case LeftPanelType.CreateNewStatus:
                    if (this.openPanel === 'createNewStatus') {
                        this.closePanel();
                    } else {
                        this.openPanel = 'createNewStatus';
                    }
                    break;
                case LeftPanelType.ManageAccount:
                    let lastUserAccountId = '';
                    if (this.userAccountUsed && this.userAccountUsed.info) {
                        lastUserAccountId = this.userAccountUsed.info.id;
                    }
                    this.userAccountUsed = this.navigationService.getAccountToManage();

                    if (this.openPanel === 'manageAccount' && this.userAccountUsed.info.id === lastUserAccountId) {
                        this.closePanel();
                    } else {
                        this.openPanel = 'manageAccount';
                    }
                    break;
                case LeftPanelType.Search:
                    if (this.openPanel === 'search') {
                        this.closePanel();
                    } else {
                        this.openPanel = 'search';
                    }
                    break;
                case LeftPanelType.Settings:
                    if (this.openPanel === 'settings') {
                        this.closePanel();
                    } else {
                        this.openPanel = 'settings';
                    }
                    break;
                default:
                    this.openPanel = '';
            }
        });
    }

    ngOnDestroy(): void {
        if(this.activatedPanelSub) {
            this.activatedPanelSub.unsubscribe();
        }
    }

    closePanel(): boolean {
        this.navigationService.closePanel();
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

    closeOverlay(): boolean {
        this.overlayActive = false;
        return false;
    }

}
