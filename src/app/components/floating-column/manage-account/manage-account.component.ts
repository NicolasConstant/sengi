import { Component, OnInit, Input } from '@angular/core';
import { faAt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { faBell, faEnvelope, faUser, faStar } from "@fortawesome/free-regular-svg-icons";

import { AccountWrapper } from '../../../models/account.models';

@Component({
    selector: 'app-manage-account',
    templateUrl: './manage-account.component.html',
    styleUrls: ['./manage-account.component.scss']
})
export class ManageAccountComponent implements OnInit {
    faAt = faAt;
    faBell = faBell;
    faEnvelope = faEnvelope;
    faUser = faUser;
    faStar = faStar;
    faUserPlus = faUserPlus;

    subPanel = 'account';
    hasNotifications = false;
    hasMentions = false;
    
    @Input() account: AccountWrapper;

    constructor() { }

    ngOnInit() {       
    }

    loadSubPanel(subpanel: string): boolean {
        this.subPanel = subpanel;
        return false;
    }
}
