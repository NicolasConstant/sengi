import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { AccountWrapper } from '../models/account.models';
import { OpenMediaEvent } from '../models/common.model';

@Injectable()
export class NavigationService {
    private accountToManage: AccountWrapper;
    activatedPanelSubject = new BehaviorSubject<OpenLeftPanelEvent>(new OpenLeftPanelEvent(LeftPanelType.Closed));
    activatedMediaSubject: Subject<OpenMediaEvent> = new Subject<OpenMediaEvent>();
    columnSelectedSubject = new BehaviorSubject<number>(-1); 

    constructor() { }

    openColumnEditor(acc: AccountWrapper) {
        this.accountToManage = acc;
        const newEvent = new OpenLeftPanelEvent(LeftPanelType.ManageAccount);
        this.activatedPanelSubject.next(newEvent);
    }

    openPanel(type: LeftPanelType){
        const newEvent = new OpenLeftPanelEvent(type);
        this.activatedPanelSubject.next(newEvent);
    }

    closePanel() {
        const newEvent = new OpenLeftPanelEvent(LeftPanelType.Closed);
        this.activatedPanelSubject.next(newEvent);
        this.accountToManage = null;
    }

    replyToUser(userHandle: string, isDirectMessage: boolean = false) {
        const action = isDirectMessage ? LeftPanelAction.DM : LeftPanelAction.Mention;
        const newEvent = new OpenLeftPanelEvent(LeftPanelType.CreateNewStatus, action, userHandle);
        this.activatedPanelSubject.next(newEvent);
    }

    redraft(statusContent: string){
        const newEvent = new OpenLeftPanelEvent(LeftPanelType.CreateNewStatus, LeftPanelAction.Redraft, null, statusContent.replace(/<[^>]*>/g, ''));
        this.activatedPanelSubject.next(newEvent);
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

export class OpenLeftPanelEvent {
    constructor(
        public type: LeftPanelType,
        public action: LeftPanelAction = LeftPanelAction.None,
        public userHandle: string = null,
        public statusContent: string = null) {
    }
}

export enum LeftPanelAction {
    None = 0,
    DM = 1,
    Mention = 2,
    Redraft = 3,
}

export enum LeftPanelType {
    Closed = 0,
    ManageAccount = 1,  
    CreateNewStatus = 2, 
    Search = 3,
    AddNewAccount = 4,
    Settings = 5
}