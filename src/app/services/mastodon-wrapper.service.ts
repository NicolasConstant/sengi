import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Account, Status, Results, Context, Relationship, Instance, Attachment, Notification, List, Poll, Emoji, Conversation, ScheduledStatus, TokenData } from "./models/mastodon.interfaces";
import { AccountInfo, UpdateAccount } from '../states/accounts.state';
import { StreamTypeEnum, StreamElement } from '../states/streams.state';
import { FavoriteResult, VisibilityEnum, PollParameters, MastodonService, BookmarkResult, FollowingResult } from './mastodon.service';
import { AuthService } from './auth.service';
import { AppInfo, RegisteredAppsStateModel } from '../states/registered-apps.state';
import { SettingsService } from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class MastodonWrapperService {    
    private refreshingToken: { [id: string]: Promise<AccountInfo> } = {};

    constructor(
        private readonly settingsService: SettingsService,
        private readonly store: Store,
        private readonly authService: AuthService,
        private readonly mastodonService: MastodonService) { }

    refreshAccountIfNeeded(accountInfo: AccountInfo): Promise<AccountInfo> {
        if(this.refreshingToken[accountInfo.id]){
            return this.refreshingToken[accountInfo.id];
        }

        let isExpired = false;
        let storedAccountInfo = this.getStoreAccountInfo(accountInfo.id);

        if(!storedAccountInfo || !(storedAccountInfo.token)) 
            return Promise.resolve(accountInfo);

        try {
            if (storedAccountInfo.token.refresh_token) {
                if (!storedAccountInfo.token.created_at || !storedAccountInfo.token.expires_in) {
                    isExpired = true;
                } else {
                    const nowEpoch = Date.now() / 1000 | 0;

                    //Pleroma workaround 
                    let expire_in = storedAccountInfo.token.expires_in;
                    if (expire_in < 3600) {
                        expire_in = 3600;
                    }

                    let expire_on = expire_in + storedAccountInfo.token.created_at;
                    isExpired = expire_on - nowEpoch <= 60 * 2;
                }
            }
        } catch (err) {
            console.error(err);
        }

        if (storedAccountInfo.token.refresh_token && isExpired) {
            const app = this.getAllSavedApps().find(x => x.instance === storedAccountInfo.instance);
            let p = this.authService.refreshToken(storedAccountInfo.instance, app.app.client_id, app.app.client_secret, storedAccountInfo.token.refresh_token)
                .then((tokenData: TokenData) => {
                    if (tokenData.refresh_token && !tokenData.created_at) {
                        const nowEpoch = Date.now() / 1000 | 0;
                        tokenData.created_at = nowEpoch;
                    }

                    storedAccountInfo.token = tokenData;
                    this.store.dispatch([new UpdateAccount(storedAccountInfo)]);

                    return storedAccountInfo;
                })
                .catch(err => {
                    return Promise.resolve(storedAccountInfo);
                });

            p.then(() => {
                this.refreshingToken[accountInfo.id] = null;
            });
            
            this.refreshingToken[accountInfo.id] = p;
            return p;
        } else {
            return Promise.resolve(storedAccountInfo);
        }
    }

    private getAllSavedApps(): AppInfo[] {
        const snapshot = <RegisteredAppsStateModel>this.store.snapshot().registeredapps;
        return snapshot.apps;
    }

    private getStoreAccountInfo(accountId: string): AccountInfo {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts.find(x => x.id === accountId);
    }

    getInstance(instance: string): Promise<Instance> {
        return this.mastodonService.getInstance(instance);
    }

    retrieveAccountDetails(account: AccountInfo): Promise<Account> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.retrieveAccountDetails(refreshedAccount);
            });
    }

    getTimeline(account: AccountInfo, type: StreamTypeEnum, max_id: string = null, since_id: string = null, limit: number = 20, tag: string = null, listId: string = null): Promise<Status[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getTimeline(refreshedAccount, type, max_id, since_id, limit, tag, listId);
            });
    }

    getConversations(account: AccountInfo, max_id: string = null, since_id: string = null, min_id = null, limit: number = 20): Promise<Conversation[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getConversations(refreshedAccount, max_id, since_id, min_id, limit);
            });
    }

    postNewStatus(account: AccountInfo, status: string, visibility: VisibilityEnum, spoiler: string = null, in_reply_to_id: string = null, mediaIds: string[], poll: PollParameters = null, scheduled_at: string = null): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.postNewStatus(refreshedAccount, status, visibility, spoiler, in_reply_to_id, mediaIds, poll, scheduled_at);
            });
    }

    getStatus(account: AccountInfo, statusId: string): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getStatus(refreshedAccount, statusId);
            });
    }

    search(account: AccountInfo, query: string, version: 'v1' | 'v2', resolve: boolean = false): Promise<Results> {
        if(query.includes('twitter.com')){
            query = this.processTwitterQuery(query);
        }

        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.search(refreshedAccount, query, version, resolve);
            });
    }

    private processTwitterQuery(query: string): string {
        const settings = this.settingsService.getSettings();
        if(!settings.twitterBridgeInstance) return query;

        let name;
        if(query.includes('twitter.com/')){
            console.log(query.replace('https://', '').replace('http://', '').split('/'));
            name = query.replace('https://', '').replace('http://', '').split('/')[1];
        }
        if(query.includes('@twitter.com')){
            console.log(query.split('@'));
            name = query.split('@')[0];
            if(name === '' || name == null){
                name = query.split('@')[1];
            }
        }
        return `@${name}@${settings.twitterBridgeInstance}`;
    }

    getAccountStatuses(account: AccountInfo, targetAccountId: number, onlyMedia: boolean, onlyPinned: boolean, excludeReplies: boolean, maxId: string, sinceId: string, limit: number = 20): Promise<Status[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getAccountStatuses(refreshedAccount, targetAccountId, onlyMedia, onlyPinned, excludeReplies, maxId, sinceId, limit);
            });
    }

    getStatusContext(account: AccountInfo, targetStatusId: string): Promise<Context> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getStatusContext(refreshedAccount, targetStatusId);
            });
    }

    getRemoteStatusContext(instance: string, targetStatusId: string): Promise<Context> {
        return this.mastodonService.getRemoteStatusContext(instance, targetStatusId);
    }

    getFavorites(account: AccountInfo, maxId: string = null): Promise<FavoriteResult> { //, minId: string = null
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getFavorites(refreshedAccount, maxId);
            });
    }

    getBookmarks(account: AccountInfo, maxId: string = null): Promise<BookmarkResult> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getBookmarks(refreshedAccount, maxId);
            });
    }

    searchAccount(account: AccountInfo, query: string, limit: number = 40, following: boolean = false, resolve = true): Promise<Account[]> {
        if(query.includes('twitter.com')){
            query = this.processTwitterQuery(query);
        }

        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.searchAccount(refreshedAccount, query, limit, following, resolve);
            });
    }

    reblog(account: AccountInfo, status: Status): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.reblog(refreshedAccount, status);
            });
    }

    unreblog(account: AccountInfo, status: Status): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.unreblog(refreshedAccount, status);
            });
    }

    favorite(account: AccountInfo, status: Status): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.favorite(refreshedAccount, status);
            });
    }

    unfavorite(account: AccountInfo, status: Status): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.unfavorite(refreshedAccount, status);
            });
    }

    bookmark(account: AccountInfo, status: Status): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.bookmark(refreshedAccount, status);
            });
    }

    unbookmark(account: AccountInfo, status: Status): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.unbookmark(refreshedAccount, status);
            });
    }

    getRelationships(account: AccountInfo, accountsToRetrieve: Account[]): Promise<Relationship[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getRelationships(refreshedAccount, accountsToRetrieve);
            });
    }

    follow(currentlyUsedAccount: AccountInfo, account: Account): Promise<Relationship> {
        return this.refreshAccountIfNeeded(currentlyUsedAccount)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.follow(refreshedAccount, account);
            });
    }

    unfollow(currentlyUsedAccount: AccountInfo, account: Account): Promise<Relationship> {
        return this.refreshAccountIfNeeded(currentlyUsedAccount)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.unfollow(refreshedAccount, account);
            });
    }

    uploadMediaAttachment(account: AccountInfo, file: File, description: string): Promise<Attachment> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.uploadMediaAttachment(refreshedAccount, file, description);
            });
    }

    updateMediaAttachment(account: AccountInfo, mediaId: string, description: string): Promise<Attachment> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.updateMediaAttachment(refreshedAccount, mediaId, description);
            });
    }

    getNotifications(account: AccountInfo, excludeTypes: ('follow' | 'favourite' | 'reblog' | 'mention' | 'poll' | 'follow_request' | 'move')[] = null, maxId: string = null, sinceId: string = null, limit: number = 15): Promise<Notification[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getNotifications(refreshedAccount, excludeTypes, maxId, sinceId, limit);
            });
    }

    getLists(account: AccountInfo): Promise<StreamElement[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getLists(refreshedAccount);
            });
    }

    createList(account: AccountInfo, title: string): Promise<StreamElement> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.createList(refreshedAccount, title);
            });
    }

    deleteList(account: AccountInfo, listId: string): Promise<any> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.deleteList(refreshedAccount, listId);
            });
    }

    getListAccounts(account: AccountInfo, listId: string): Promise<Account[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getListAccounts(refreshedAccount, listId);
            });
    }

    addAccountToList(account: AccountInfo, listId: string, accountId: number): Promise<any> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.addAccountToList(refreshedAccount, listId, accountId);
            });
    }

    removeAccountFromList(account: AccountInfo, listId: string, accountId: number): Promise<any> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.removeAccountFromList(refreshedAccount, listId, accountId);
            });
    }

    voteOnPoll(account: AccountInfo, pollId: string, pollSelection: number[]): Promise<Poll> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.voteOnPoll(refreshedAccount, pollId, pollSelection);
            });
    }

    getPoll(account: AccountInfo, pollId: string): Promise<Poll> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getPoll(refreshedAccount, pollId);
            });
    }

    mute(account: AccountInfo, accountId: number): Promise<Relationship> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.mute(refreshedAccount, accountId);
            });
    }

    block(account: AccountInfo, accountId: number): Promise<Relationship> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.block(refreshedAccount, accountId);
            });
    }

    pinOnProfile(account: AccountInfo, statusId: string): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.pinOnProfile(refreshedAccount, statusId);
            });
    }

    unpinFromProfile(account: AccountInfo, statusId: string): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.unpinFromProfile(refreshedAccount, statusId);
            });
    }

    muteConversation(account: AccountInfo, statusId: string): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.muteConversation(refreshedAccount, statusId);
            });
    }

    unmuteConversation(account: AccountInfo, statusId: string): Promise<Status> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.unmuteConversation(refreshedAccount, statusId);
            });
    }

    deleteStatus(account: AccountInfo, statusId: string): Promise<any> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.deleteStatus(refreshedAccount, statusId);
            });
    }

    getCustomEmojis(account: AccountInfo): Promise<Emoji[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getCustomEmojis(refreshedAccount);
            });
    }

    getScheduledStatuses(account: AccountInfo): Promise<ScheduledStatus[]> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getScheduledStatuses(refreshedAccount);
            });
    }

    changeScheduledStatus(account: AccountInfo, statusId: string, scheduled_at: string): Promise<ScheduledStatus> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.changeScheduledStatus(refreshedAccount, statusId, scheduled_at);
            });
    }

    deleteScheduledStatus(account: AccountInfo, statusId: string): Promise<any> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.deleteScheduledStatus(refreshedAccount, statusId);
            });
    }

    getFollowing(account: AccountInfo, accountId: number, maxId: string, sinceId: string, limit: number = 40):  Promise<FollowingResult> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getFollowing(refreshedAccount, accountId, maxId, sinceId, limit);
            });
    }

    getFollowers(account: AccountInfo, accountId: number, maxId: string, sinceId: string, limit: number = 40):  Promise<FollowingResult> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.getFollowers(refreshedAccount, accountId, maxId, sinceId, limit);
            });
    }

    authorizeFollowRequest(account: AccountInfo, id: number): Promise<Relationship> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.authorizeFollowRequest(refreshedAccount, id);
            });
    }

    rejectFollowRequest(account: AccountInfo, id: number): Promise<Relationship> {
        return this.refreshAccountIfNeeded(account)
            .then((refreshedAccount: AccountInfo) => {
                return this.mastodonService.rejectFollowRequest(refreshedAccount, id);
            });
    }
}
