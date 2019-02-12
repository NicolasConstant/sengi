import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class NotificationService {
    public notifactionStream = new Subject<NotificatioData>();

    constructor() {
    }

    public notify(message: string, isError: boolean){
        let newNotification = new NotificatioData(message, isError);
        this.notifactionStream.next(newNotification);
    }

    public notifyHttpError(err: HttpErrorResponse){
        let message = `${err.status}: ${err.message}`;
        this.notify(message, true);
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
