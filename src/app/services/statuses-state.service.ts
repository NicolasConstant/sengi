import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StatusesStateService {    
    private cachedStatusStates: { [statusId: string]: { [accountId: string]: StatusState } } = {};    
    public stateNotification = new Subject<StatusState>();

    constructor() { }

    getStateForStatus(statusId: string): StatusState[] {
        if(!this.cachedStatusStates[statusId]) 
            return null;

        let results: StatusState[] = [];
        Object.entries(this.cachedStatusStates[statusId]).forEach(
            ([key, value]) => {
                results.push(value);
            }
        );
        return results;
    }

    statusFavoriteStatusChanged(statusId: string, accountId: string, isFavorited: boolean) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, isFavorited, null, null);
        } else {
            this.cachedStatusStates[statusId][accountId].isFavorited = isFavorited;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }

    statusReblogStatusChanged(statusId: string, accountId: string, isRebloged: boolean) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, null, isRebloged, null);
        } else {
            this.cachedStatusStates[statusId][accountId].isRebloged = isRebloged;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }

    statusBookmarkStatusChanged(statusId: string, accountId: string, isBookmarked: boolean) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, null, null, isBookmarked);
        } else {
            this.cachedStatusStates[statusId][accountId].isBookmarked = isBookmarked;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }
}

export class StatusState {
    
    constructor(
        public statusId: string, 
        public accountId: string, 
        public isFavorited: boolean, 
        public isRebloged: boolean,
        public isBookmarked: boolean) {
    }
}
