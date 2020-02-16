import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StatusesStateService {
    private cachedStatusStates: { [statusId: string]: { [accountId: string]: StatusState } } = {};    
    public stateNotification = new Subject<StatusState>();

    constructor() { }

    getStateForStatus(statusId: string, accountId: string): StatusState {
        if(!this.cachedStatusStates[statusId] || !this.cachedStatusStates[statusId][accountId]) 
            return null;

        return this.cachedStatusStates[statusId][accountId];
    }

    statusFavoriteStatusChanged(statusId: string, accountId: string, isFavorited: boolean) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, isFavorited, false);
        } else {
            this.cachedStatusStates[statusId][accountId].isFavorited = isFavorited;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }

    statusReblogStatusChanged(statusId: string, accountId: string, isRebloged: boolean) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, false, isRebloged);
        } else {
            this.cachedStatusStates[statusId][accountId].isRebloged = isRebloged;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }
}


class StatusState {
    constructor(public statusId: string, public accountId: string, public isFavorited: boolean, public isRebloged: boolean) {
    }
}
