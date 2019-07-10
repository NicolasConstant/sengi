import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StatusWrapper } from '../models/common.model';
import { Account } from './models/mastodon.interfaces';

@Injectable()
export class NotificationService {
    public notifactionStream = new Subject<NotificatioData>();
    public newRespondPostedStream = new Subject<NewReplyData>();
    public hideAccountUrlStream = new Subject<string>();
    public deletedStatusStream = new Subject<StatusWrapper>();

    constructor() {
    }

    public notify(message: string, isError: boolean){
        let newNotification = new NotificatioData(message, isError);
        this.notifactionStream.next(newNotification);
    }

    public notifyHttpError(err: HttpErrorResponse){    
        let message = 'Oops, Unknown Error'  ;
        try{  
            message = `Oops, Error ${err.status}`;
            console.error(err.message);
        } catch(err){}
        this.notify(message, true);
    }

    // public newStatusPosted(status: StatusWrapper){
    public newStatusPosted(uiStatusRepliedToId: string, response: StatusWrapper){
        const notification = new NewReplyData(uiStatusRepliedToId, response);
        this.newRespondPostedStream.next(notification);
    }

    public hideAccount(account: Account){
        this.hideAccountUrlStream.next(account.url);
    }

    public deleteStatus(status: StatusWrapper){
        this.deletedStatusStream.next(status);
    }
}

export class NotificatioData {
    public id: string;

    constructor(
        public message: string,
        public isError: boolean
    ) { 
        this.id = `${message}${new Date().getTime()}`;
    }
}

export class NewReplyData {
    constructor(public uiStatusId: string, public response: StatusWrapper){

    }
}
