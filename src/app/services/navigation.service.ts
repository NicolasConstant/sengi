import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { AccountWrapper } from '../models/account.models';
import { OpenMediaEvent } from '../models/common.model';

@Injectable()
export class NavigationService {
    private accountToManage: AccountWrapper;
    activatedPanelSubject = new BehaviorSubject<LeftPanelType>(LeftPanelType.Closed);
    activatedMediaSubject: Subject<OpenMediaEvent> = new Subject<OpenMediaEvent>();
    columnSelectedSubject = new BehaviorSubject<number>(-1); 

    constructor() { }

    openColumnEditor(acc: AccountWrapper) {
        this.accountToManage = acc;
        this.activatedPanelSubject.next(LeftPanelType.ManageAccount);
    }

    openPanel(type: LeftPanelType){
        this.activatedPanelSubject.next(type);
    }

    closePanel() {
        this.activatedPanelSubject.next(LeftPanelType.Closed);
        this.accountToManage = null;
    }

    columnSelected(index: number): void {
        this.columnSelectedSubject.next(index);
    }

    getAccountToManage(): AccountWrapper {
        return this.accountToManage;
    }

    openMedia(openMediaEvent: OpenMediaEvent): void{
        this.activatedMediaSubject.next(openMediaEvent);
    }
}

export enum LeftPanelType {
    Closed = 0,
    ManageAccount = 1,  
    CreateNewStatus = 2, 
    Search = 3,
    AddNewAccount = 4,
    Settings = 5
}