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
        let message = 'Oops, Unknown Error'  ;
        try{  
            message = `Oops, Error ${err.status}`;
            console.error(err.message);
        } catch(err){}
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
