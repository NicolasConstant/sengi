import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';

import { ApiRoutes } from './models/api.settings';
import { Account, Status, Results, Context, Relationship, Instance, Attachment, Notification, List, Poll, Emoji, Conversation } from "./models/mastodon.interfaces";
import { AccountInfo } from '../states/accounts.state';
import { StreamTypeEnum, StreamElement } from '../states/streams.state';

@Injectable()
export class MastodonService {           
    private apiRoutes = new ApiRoutes();

    constructor(private readonly httpClient: HttpClient) { }

    getInstance(instance: string): Promise<Instance> {
        const route = `https://${instance}${this.apiRoutes.getInstance}`;
        return this.httpClient.get<Instance>(route).toPromise();
    }

    retrieveAccountDetails(account: AccountInfo): Promise<Account> {
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Account>('https://' + account.instance + this.apiRoutes.getCurrentAccount, { headers: headers }).toPromise();
    }

    getTimeline(account: AccountInfo, type: StreamTypeEnum, max_id: string = null, since_id: string = null, limit: number = 20, tag: string = null, listId: string = null): Promise<Status[]> {
        const route = `https://${account.instance}${this.getTimelineRoute(type, max_id, since_id, limit, tag, listId)}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Status[]>(route, { headers: headers }).toPromise();
    }

    getConversations(account: AccountInfo, max_id: string = null, since_id: string = null, min_id = null, limit: number = 20,): Promise<Conversation[]> {        
        let params = `?limit=${limit}`;
        if (max_id) params += `&max_id=${max_id}`;
        if (since_id) params += `&since_id=${since_id}`;
        if (min_id) params += `&since_id=${min_id}`;

        const route = `https://${account.instance}${this.apiRoutes.getConversations}${params}`;

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Conversation[]>(route, { headers: headers }).toPromise();
    }

    private getTimelineRoute(type: StreamTypeEnum, max_id: string, since_id: string, limit: number, tag: string, listId: string): string {
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
                route = this.apiRoutes.getTagTimeline.replace('{0}', tag);
                break;
            case StreamTypeEnum.list:
                route = this.apiRoutes.getListTimeline.replace('{0}', listId);
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

    postNewStatus(account: AccountInfo, status: string, visibility: VisibilityEnum, spoiler: string = null, in_reply_to_id: string = null, mediaIds: string[]): Promise<Status> {
        const url = `https://${account.instance}${this.apiRoutes.postNewStatus}`;

        const statusData = new StatusData();
        statusData.status = status;
        statusData.media_ids = mediaIds;

        if (in_reply_to_id) {
            statusData.in_reply_to_id = in_reply_to_id;
        }
        if (spoiler) {
            statusData.sensitive = true;
            statusData.spoiler_text = spoiler;
        }
        switch (visibility) {
            case VisibilityEnum.Public:
                statusData.visibility = 'public';
                break;
            case VisibilityEnum.Unlisted:
                statusData.visibility = 'unlisted';
                break;
            case VisibilityEnum.Private:
                statusData.visibility = 'private';
                break;
            case VisibilityEnum.Direct:
                statusData.visibility = 'direct';
                break;
            default:
                statusData.visibility = 'private';
                break;
        }

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(url, statusData, { headers: headers }).toPromise();
    }

    getStatus(account: AccountInfo, statusId: string): Promise<Status> {
        const route = `https://${account.instance}${this.apiRoutes.getStatus.replace('{0}', statusId)}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Status>(route, { headers: headers }).toPromise()
    }

    search(account: AccountInfo, query: string, resolve: boolean = false): Promise<Results> {
        if (query[0] === '#') query = query.substr(1);
        const route = `https://${account.instance}${this.apiRoutes.search}?q=${query}&resolve=${resolve}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Results>(route, { headers: headers }).toPromise()
    }

    getAccountStatuses(account: AccountInfo, targetAccountId: number, onlyMedia: boolean, onlyPinned: boolean, excludeReplies: boolean, maxId: string, sinceId: string, limit: number = 20): Promise<Status[]> {
        const route = `https://${account.instance}${this.apiRoutes.getAccountStatuses}`.replace('{0}', targetAccountId.toString());
        let params = `?only_media=${onlyMedia}&pinned=${onlyPinned}&exclude_replies=${excludeReplies}&limit=${limit}`;

        if (maxId) params += `&max_id=${maxId}`;
        if (sinceId) params += `&since_id=${sinceId}`;

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Status[]>(route + params, { headers: headers }).toPromise();
    }

    getStatusContext(account: AccountInfo, targetStatusId: string): Promise<Context> {
        const params = this.apiRoutes.getStatusContext.replace('{0}', targetStatusId);
        const route = `https://${account.instance}${params}`;

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Context>(route, { headers: headers }).toPromise();
    }

    getFavorites(account: AccountInfo, maxId: string = null): Promise<FavoriteResult> { //, minId: string = null
        let route = `https://${account.instance}${this.apiRoutes.getFavourites}`; //?limit=${limit}

        if (maxId) route += `?max_id=${maxId}`;
        //if (minId) route += `&min_id=${minId}`;

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get(route, { headers: headers, observe: "response" }).toPromise()
            .then((res: HttpResponse<Status[]>) => {                
                const link = res.headers.get('Link');
                let lastId = null;
                if(link){
                    const maxId = link.split('max_id=')[1];
                    if(maxId){
                        lastId = maxId.split('>;')[0];
                    }
                }
                return new FavoriteResult(lastId, res.body);
            });
    }

    searchAccount(account: AccountInfo, query: string, limit: number = 40, following: boolean = false, resolve = true): Promise<Account[]> {
        const route = `https://${account.instance}${this.apiRoutes.searchForAccounts}?q=${query}&limit=${limit}&following=${following}&resolve=${resolve}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Account[]>(route, { headers: headers }).toPromise()
    }

    reblog(account: AccountInfo, status: Status): Promise<Status> {
        const route = `https://${account.instance}${this.apiRoutes.reblogStatus}`.replace('{0}', status.id);
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise()
    }

    unreblog(account: AccountInfo, status: Status): Promise<Status> {
        const route = `https://${account.instance}${this.apiRoutes.unreblogStatus}`.replace('{0}', status.id);
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise()
    }

    favorite(account: AccountInfo, status: Status): Promise<Status> {
        const route = `https://${account.instance}${this.apiRoutes.favouritingStatus}`.replace('{0}', status.id);
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise()
    }

    unfavorite(account: AccountInfo, status: Status): Promise<Status> {
        const route = `https://${account.instance}${this.apiRoutes.unfavouritingStatus}`.replace('{0}', status.id);
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise()
    }

    getRelationships(account: AccountInfo, accountsToRetrieve: Account[]): Promise<Relationship[]> {
        let params = `?${this.formatArray(accountsToRetrieve.map(x => x.id.toString()), 'id')}`;

        // accountsToRetrieve.forEach(x => {
        //     if (params.includes('id')) params += '&';
        //     params += `id[]=${x.id}`;
        // });

        const route = `https://${account.instance}${this.apiRoutes.getAccountRelationships}${params}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Relationship[]>(route, { headers: headers }).toPromise();
    }

    follow(currentlyUsedAccount: AccountInfo, account: Account): Promise<Relationship> {
        const route = `https://${currentlyUsedAccount.instance}${this.apiRoutes.follow}`.replace('{0}', account.id.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${currentlyUsedAccount.token.access_token}` });
        return this.httpClient.post<Relationship>(route, null, { headers: headers }).toPromise();
    }

    unfollow(currentlyUsedAccount: AccountInfo, account: Account): Promise<Relationship> {
        const route = `https://${currentlyUsedAccount.instance}${this.apiRoutes.unfollow}`.replace('{0}', account.id.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${currentlyUsedAccount.token.access_token}` });
        return this.httpClient.post<Relationship>(route, null, { headers: headers }).toPromise();

    }

    uploadMediaAttachment(account: AccountInfo, file: File, description: string): Promise<Attachment> {
        let input = new FormData();
        input.append('file', file);
        input.append('description', description);
        const route = `https://${account.instance}${this.apiRoutes.uploadMediaAttachment}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Attachment>(route, input, { headers: headers }).toPromise();
    }

    //TODO: add focus support
    updateMediaAttachment(account: AccountInfo, mediaId: string, description: string): Promise<Attachment> {
        let input = new FormData();
        input.append('description', description);
        const route = `https://${account.instance}${this.apiRoutes.updateMediaAttachment.replace('{0}', mediaId)}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.put<Attachment>(route, input, { headers: headers }).toPromise();
    }

    getNotifications(account: AccountInfo, excludeTypes: string[] = null, maxId: string = null, sinceId: string = null, limit: number = 15): Promise<Notification[]> {
        let route = `https://${account.instance}${this.apiRoutes.getNotifications}?limit=${limit}`;

        if(maxId){
            route += `&max_id=${maxId}`;
        }

        if(sinceId){
            route += `&since_id=${sinceId}`;
        }

        if(excludeTypes && excludeTypes.length > 0) {
            const excludeTypeArray = this.formatArray(excludeTypes, 'exclude_types');
            route += `&${excludeTypeArray}`;
        }

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Notification[]>(route, { headers: headers }).toPromise();
    }

    private formatArray(data: string[], paramName: string): string {
        let result = '';
        data.forEach(x => {
            if (result.includes(paramName)) result += '&';
            result += `${paramName}[]=${x}`;
        });
        return result;
    } 

    getLists(account: AccountInfo): Promise<StreamElement[]> {
        let route = `https://${account.instance}${this.apiRoutes.getLists}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<List[]>(route, { headers: headers }).toPromise()
            .then((lists: List[]) => {
                const streams: StreamElement[] = [];
                for (const list of lists) {
                    const stream = new StreamElement(StreamTypeEnum.list, list.title, account.id, null, list.title, list.id, account.instance);
                    streams.push(stream);
                }
                return streams;
            });
    }

    createList(account: AccountInfo, title: string): Promise<StreamElement> {
        let route = `https://${account.instance}${this.apiRoutes.postList}?title=${title}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<List>(route, null, { headers: headers }).toPromise()
            .then((list: List) => {
                return new StreamElement(StreamTypeEnum.list, list.title, account.id, null, list.title, list.id, account.instance);
            });
    }  

    deleteList(account: AccountInfo, listId: string): Promise<any> {
        let route = `https://${account.instance}${this.apiRoutes.deleteList}`.replace('{0}', listId);       
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.delete(route, { headers: headers }).toPromise();
    } 

    getListAccounts(account: AccountInfo, listId: string): Promise<Account[]> {
        let route = `https://${account.instance}${this.apiRoutes.getAccountsInList}`.replace('{0}', listId);
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Account[]>(route, { headers: headers }).toPromise();
    }   

    addAccountToList(account: AccountInfo, listId: string, accountId: number): Promise<any> {
        let route = `https://${account.instance}${this.apiRoutes.addAccountToList}`.replace('{0}', listId);
        route += `?account_ids[]=${accountId}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post(route, null, { headers: headers }).toPromise();
    }

    removeAccountFromList(account: AccountInfo, listId: string, accountId: number): Promise<any> {
        let route = `https://${account.instance}${this.apiRoutes.addAccountToList}`.replace('{0}', listId);
        route += `?account_ids[]=${accountId}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.delete(route, { headers: headers }).toPromise();
    }

    voteOnPoll(account: AccountInfo, pollId: string, pollSelection: number[]): Promise<Poll> {
        let route = `https://${account.instance}${this.apiRoutes.voteOnPoll}`.replace('{0}', pollId);
        route += `?${this.formatArray(pollSelection.map(x => x.toString()), 'choices')}`;

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Poll>(route, null, { headers: headers }).toPromise();
    } 

    getPoll(account: AccountInfo, pollId: string): Promise<Poll> {
        let route = `https://${account.instance}${this.apiRoutes.getPoll}`.replace('{0}', pollId);
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.get<Poll>(route, { headers: headers }).toPromise();
    }

    mute(account: AccountInfo, accounId: number): Promise<Relationship> {
        let route = `https://${account.instance}${this.apiRoutes.mute}`.replace('{0}', accounId.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Relationship>(route, null, { headers: headers }).toPromise();
    }

    block(account: AccountInfo, accounId: number): Promise<Relationship> {
        let route = `https://${account.instance}${this.apiRoutes.block}`.replace('{0}', accounId.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Relationship>(route, null, { headers: headers }).toPromise();
    }

    pinOnProfile(account: AccountInfo, statusId: string): Promise<Status> {
        let route = `https://${account.instance}${this.apiRoutes.pinStatus}`.replace('{0}', statusId.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise();
    }

    unpinFromProfile(account: AccountInfo, statusId: string): Promise<Status> {
        let route = `https://${account.instance}${this.apiRoutes.unpinStatus}`.replace('{0}', statusId.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise();
    }

    muteConversation(account: AccountInfo, statusId: string): Promise<Status> {
        let route = `https://${account.instance}${this.apiRoutes.muteStatus}`.replace('{0}', statusId.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise();
    }
  
    unmuteConversation(account: AccountInfo, statusId: string): Promise<Status> {
        let route = `https://${account.instance}${this.apiRoutes.unmuteStatus}`.replace('{0}', statusId.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.post<Status>(route, null, { headers: headers }).toPromise();
    }

    deleteStatus(account: AccountInfo, statusId: string): Promise<any> {
        let route = `https://${account.instance}${this.apiRoutes.deleteStatus}`.replace('{0}', statusId.toString());
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        return this.httpClient.delete<any>(route, { headers: headers }).toPromise();
    } 
    
    getCustomEmojis(account: AccountInfo): Promise<Emoji[]> {
        let route = `https://${account.instance}${this.apiRoutes.getCustomEmojis}`;
        return this.httpClient.get<Emoji[]>(route).toPromise();
    }   
}

export enum VisibilityEnum {
    Unknown = 0,
    Public = 1,
    Unlisted = 2,
    Private = 3,
    Direct = 4
}

class StatusData {
    status: string;
    media_ids: string[];
    in_reply_to_id: string;
    sensitive: boolean;
    spoiler_text: string;
    visibility: string;
}

export class FavoriteResult {
    constructor(
        public max_id: string,
        public favorites: Status[]) {}   
}