import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { StatusWrapper } from '../models/common.model';
import { Account } from './models/mastodon.interfaces';
import { AccountInfo } from '../states/accounts.state';
import { ToolsService } from './tools.service';

@Injectable()
export class NotificationService {
    public restartNotificationStream = new Subject<string>();
    public notificationStream = new Subject<NotificationData>();
    public newRespondPostedStream = new Subject<NewReplyData>();
    public hideAccountUrlStream = new Subject<string>();
    public deletedStatusStream = new Subject<StatusWrapper>();

    constructor(private readonly toolsService: ToolsService) {
    }

    public notify(avatar: string, errorCode: number, message: string, isError: boolean) {
        let newNotification = new NotificationData(avatar, errorCode, message, isError);
        this.notificationStream.next(newNotification);
    }

    public notifyHttpError(err: HttpErrorResponse, account: AccountInfo) {
        let message = 'Oops, Unknown Error';
        let code: number;

        try {
            code = err.status;
            if(err.message){
                message = err.message;
            } else if(err.error && err.error.error) {
                message = err.error.error; //Mastodon
            } else if(err.error && err.error.errors && err.error.errors.detail){
                message = err.error.errors.detail; //Pleroma
            }
        } catch (err) { }

        if (account) {
            this.toolsService.getAvatar(account)
                .then((avatar: string) => {
                    this.notify(avatar, code, message, true);
                })
                .catch(err => {

                });
        } else {
            this.notify(null, code, message, true);
        }
    }

    // public newStatusPosted(status: StatusWrapper){
    public newStatusPosted(uiStatusRepliedToId: string, response: StatusWrapper) {
        const notification = new NewReplyData(uiStatusRepliedToId, response);
        this.newRespondPostedStream.next(notification);
    }

    public hideAccount(account: Account) {
        this.hideAccountUrlStream.next(account.url);
    }

    public deleteStatus(status: StatusWrapper) {
        this.deletedStatusStream.next(status);
    }

    public notifyRestartNotification(label: string){
        this.restartNotificationStream.next(label);
    }
}

export class NotificationData {
    public id: string;

    constructor(
        public avatar: string,
        public errorCode: number,
        public message: string,
        public isError: boolean
    ) {
        this.id = `${message}${new Date().getTime()}`;
    }
}

export class NewReplyData {
    constructor(public uiStatusId: string, public response: StatusWrapper) {

    }
}
