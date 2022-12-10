import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { StatusWrapper } from '../models/common.model';

@Injectable({
    providedIn: 'root'
})
export class StatusesStateService {
    private cachedStatusText: { [statusId: string]: string } = {};
    private cachedStatusStates: { [statusId: string]: { [accountId: string]: StatusState } } = {};
    public stateNotification = new Subject<StatusState>();

    constructor() { }

    getStateForStatus(statusId: string): StatusState[] {
        if (!this.cachedStatusStates[statusId])
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
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, isFavorited, null, null, null, null, null);
        } else {
            this.cachedStatusStates[statusId][accountId].isFavorited = isFavorited;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }

    statusReblogStatusChanged(statusId: string, accountId: string, isRebloged: boolean) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, null, isRebloged, null, null, null, null);
        } else {
            this.cachedStatusStates[statusId][accountId].isRebloged = isRebloged;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }

    statusBookmarkStatusChanged(statusId: string, accountId: string, isBookmarked: boolean) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, null, null, isBookmarked, null, null, null);
        } else {
            this.cachedStatusStates[statusId][accountId].isBookmarked = isBookmarked;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }

    statusEditedStatusChanged(statusId: string, accountId: string, editedStatus: StatusWrapper) {
        if (!this.cachedStatusStates[statusId])
            this.cachedStatusStates[statusId] = {};

        if (!this.cachedStatusStates[statusId][accountId]) {
            this.cachedStatusStates[statusId][accountId] = new StatusState(statusId, accountId, null, null, null, true, new Date().toISOString(), editedStatus);
        } else {
            this.cachedStatusStates[statusId][accountId].isEdited = true;
            this.cachedStatusStates[statusId][accountId].editionTime = new Date().toISOString();
            this.cachedStatusStates[statusId][accountId].editedStatus = editedStatus;
        }

        this.stateNotification.next(this.cachedStatusStates[statusId][accountId]);
    }

    setStatusContent(data: string, replyingToStatus: StatusWrapper) {
        if (replyingToStatus) {
            this.cachedStatusText[replyingToStatus.status.uri] = data;
        } else {
            this.cachedStatusText['none'] = data;
        }
    }

    getStatusContent(replyingToStatus: StatusWrapper): string {
        let data: string;
        if (replyingToStatus) {
            data = this.cachedStatusText[replyingToStatus.status.uri];
        } else {
            data = this.cachedStatusText['none'];
        }

        if (!data) return '';
        return data;
    }

    resetStatusContent(replyingToStatus: StatusWrapper) {
        if (replyingToStatus) {
            this.cachedStatusText[replyingToStatus.status.uri] = '';
        } else {
            this.cachedStatusText['none'] = '';
        }
    }
}

export class StatusState {

    constructor(
        public statusId: string,
        public accountId: string,
        public isFavorited: boolean,
        public isRebloged: boolean,
        public isBookmarked: boolean,
        public isEdited: boolean,        
        public editionTime: string,
        public editedStatus: StatusWrapper) {
    }
}
