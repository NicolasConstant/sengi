import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { ApiRoutes } from './models/api.settings';
import { Account, Status } from "./models/mastodon.interfaces";
import { AccountInfo } from '../states/accounts.state';
import { StreamTypeEnum } from '../states/streams.state';

@Injectable()
export class MastodonService {

    private apiRoutes = new ApiRoutes();

    constructor(private readonly httpClient: HttpClient) { }

    retrieveAccountDetails(account: AccountInfo): Promise<Account> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Account>('https://' + account.instance + this.apiRoutes.getCurrentAccount, { headers: headers }).toPromise();
    }

    getTimeline(account: AccountInfo, type: StreamTypeEnum, max_id: string = null, since_id: string = null, limit: number = 20): Promise<Status[]> {
        const route = `https://${account.instance}${this.getTimelineRoute(type, max_id, since_id, limit)}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Status[]>(route, { headers: headers }).toPromise()
    }

    private getTimelineRoute(type: StreamTypeEnum, max_id: string, since_id: string, limit: number): string {
        let route: string;
        switch (type) {
            case StreamTypeEnum.personnal:
                route = this.apiRoutes.getHomeTimeline;
                break;
            case StreamTypeEnum.local:
                route = this.apiRoutes.getPublicTimeline + `?local=true&`;
                break;
            case StreamTypeEnum.global:
                route = this.apiRoutes.getPublicTimeline + `?local=false&`;
                break;
            case StreamTypeEnum.directmessages:
                route = this.apiRoutes.getDirectTimeline;
                break;
            case StreamTypeEnum.tag:
                route = this.apiRoutes.getTagTimeline.replace('{0}', 'TODO');
                break;
            case StreamTypeEnum.list:
                route = this.apiRoutes.getListTimeline.replace('{0}', 'TODO');
                break;
            default:
                throw new Error('StreamTypeEnum not supported');
        }

        if (!route.includes('?')) route = route + '?';
        if (max_id) route = route + `max_id=${max_id}&`;
        if (since_id) route = route + `since_id=${since_id}&`;
        if (limit) route = route + `limit=${limit}&`;

        return this.trimChar(this.trimChar(route, '?'), '&');
    }

    private escapeRegExp(strToEscape) {
        // Escape special characters for use in a regular expression
        return strToEscape.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    
    private trimChar(origString, charToTrim) {
        charToTrim = this.escapeRegExp(charToTrim);
        var regEx = new RegExp("^[" + charToTrim + "]+|[" + charToTrim + "]+$", "g");
        return origString.replace(regEx, "");
    };


    postNewStatus(account: AccountInfo, status:string): Promise<Status>{
        const url = `https://${account.instance}${this.apiRoutes.postNewStatus}`;

        const formData = new FormData();

        formData.append('status', status);
        // formData.append('in_reply_to_id', in_reply_to_id);
        // formData.append('media_ids', media_ids);
        // formData.append('sensitive', sensitive);
        // formData.append('sensitive', sensitive);
        // formData.append('spoiler_text', spoiler_text);
        formData.append('visibility', 'direct');
        // formData.append('language', '');
        
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });

        return this.httpClient.post<Status>(url, formData, { headers: headers }).toPromise();
    }
}
