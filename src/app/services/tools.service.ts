import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { Account, Results, Status, Emoji } from "./models/mastodon.interfaces";
import { StatusWrapper } from '../models/common.model';
import { AccountSettings, SaveAccountSettings, GlobalSettings, SaveSettings, ContentWarningPolicy, SaveContentWarningPolicy, ContentWarningPolicyEnum, TimeLineModeEnum, TimeLineHeaderEnum } from '../states/settings.state';
import { SettingsService } from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class ToolsService {
    private accountAvatar: { [id: string]: string; } = {};
    private instanceInfos: { [id: string]: InstanceInfo } = {};

    constructor(
        private readonly settingsService: SettingsService,
        private readonly mastodonService: MastodonWrapperService,
        private readonly store: Store) { }

    checkContentWarning(status: Status): StatusWithCwPolicyResult {
        if(!status) {
            return new StatusWithCwPolicyResult(status, false, false);
        }

        let applyCw = false;
        let hideStatus = false;
        
        let cwPolicy = this.settingsService.getSettings().contentWarningPolicy;

        let splittedContent = [];
        if ((cwPolicy.policy === ContentWarningPolicyEnum.HideAll && cwPolicy.addCwOnContent.length > 0)
            || (cwPolicy.policy === ContentWarningPolicyEnum.AddOnAllContent && cwPolicy.removeCwOnContent.length > 0)
            || (cwPolicy.hideCompletelyContent && cwPolicy.hideCompletelyContent.length > 0)) {
            let parser = new DOMParser();
            let dom = parser.parseFromString((status.content + ' ' + status.spoiler_text).replace("<br/>", " ").replace("<br>", " ").replace(/\n/g, ' '), 'text/html')
            let contentToParse = dom.body.textContent;
            splittedContent = contentToParse.toLowerCase().split(' ');
        }

        if (cwPolicy.policy === ContentWarningPolicyEnum.None && (status.sensitive || status.spoiler_text)) {
            applyCw = true;            
        } else if (cwPolicy.policy === ContentWarningPolicyEnum.HideAll) {
            let detected = cwPolicy.addCwOnContent.filter(x => splittedContent.find(y => y == x || y == `#${x}`));
            if (!detected || detected.length === 0) {
                applyCw = false;                
            } else {
                if (!status.spoiler_text) {
                    status.spoiler_text = detected.join(' ');
                }
                applyCw = true;                
            }
        } else if (cwPolicy.policy === ContentWarningPolicyEnum.AddOnAllContent) {
            let detected = cwPolicy.removeCwOnContent.filter(x => splittedContent.find(y => y == x || y == `#${x}`));

            if (detected && detected.length > 0) {
                applyCw = false;                
            } else {               
                applyCw = true;                
            }
        }

        if (cwPolicy.hideCompletelyContent && cwPolicy.hideCompletelyContent.length > 0) {
            let detected = cwPolicy.hideCompletelyContent.filter(x => splittedContent.find(y => y == x || y == `#${x}`));
            if (detected && detected.length > 0) {
                hideStatus = true;
            }
        }

        return new StatusWithCwPolicyResult(status, applyCw, hideStatus);
    }

    getInstanceInfo(acc: AccountInfo): Promise<InstanceInfo> {
        if (this.instanceInfos[acc.instance]) {
            return Promise.resolve(this.instanceInfos[acc.instance]);
        } else {
            return this.mastodonService.getInstance(acc.instance)
                .then(instance => {
                    var type = InstanceType.Mastodon;
                    if (instance.version.toLowerCase().includes('pleroma')) {
                        type = InstanceType.Pleroma;
                    } else if (instance.version.toLowerCase().includes('+glitch')) {
                        type = InstanceType.GlitchSoc;
                    } else if (instance.version.toLowerCase().includes('+florence')) {
                        type = InstanceType.Florence;
                    } else if (instance.version.toLowerCase().includes('pixelfed')) {
                        type = InstanceType.Pixelfed;
                    }

                    var splittedVersion = instance.version.split('.');
                    var major = +splittedVersion[0];
                    var minor = +splittedVersion[1];

                    var instanceInfo = new InstanceInfo(type, major, minor);
                    this.instanceInfos[acc.instance] = instanceInfo;

                    return instanceInfo;
                });
        }
    }

    getAvatar(acc: AccountInfo): Promise<string> {
        if (this.accountAvatar[acc.id]) {
            return Promise.resolve(this.accountAvatar[acc.id]);
        } else {
            return this.mastodonService.retrieveAccountDetails(acc)
                .then((result: Account) => {
                    this.accountAvatar[acc.id] = result.avatar;
                    return result.avatar;
                })
                .catch((err) => {
                    return "";
                });
        }
    }

    getSelectedAccounts(): AccountInfo[] {
        let regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts.filter(x => x.isSelected);
    }

    getAllAccounts(): AccountInfo[] {
        let regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }

    getAccountById(accountId: string): AccountInfo {
        let regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts.find(x => x.id === accountId);
    }

    findAccount(account: AccountInfo, accountName: string): Promise<Account> {
        let findAccountFunc = (result: Results) => {
            if (accountName[0] === '@') accountName = accountName.substr(1);

            const foundAccount = result.accounts.find(
                x => (x.acct.toLowerCase() === accountName.toLowerCase()
                    ||
                    (x.acct.toLowerCase().split('@')[0] === accountName.toLowerCase().split('@')[0])
                    && x.url.replace('https://', '').split('/')[0] === accountName.toLowerCase().split('@')[1])
            );
            return foundAccount;
        };

        let searchVersion: 'v1' | 'v2' = 'v1';
        return this.getInstanceInfo(account)
            .then(instance => {
                //let version: 'v1' | 'v2' = 'v1';
                if (instance.major >= 3) searchVersion = 'v2';
                return this.mastodonService.search(account, accountName, searchVersion, true);
            })
            .then((results: Results) => {
                return findAccountFunc(results);
            })
            .then((foundAccount: Account) => {
                if (foundAccount != null) return Promise.resolve(foundAccount);

                let fullName = `https://${accountName.split('@')[1]}/@${accountName.split('@')[0]}`;
                return this.mastodonService.search(account, fullName, searchVersion, true)
                    .then((results: Results) => {
                        return findAccountFunc(results);
                    });
            });
    }

    getStatusUsableByAccount(account: AccountInfo, originalStatus: StatusWrapper): Promise<Status> {
        let isProvider = false;
        if(!originalStatus.isRemote){
            isProvider = originalStatus.provider.id === account.id;
        }        

        let statusPromise: Promise<Status> = Promise.resolve(originalStatus.status);

        if (!isProvider) {
            statusPromise = statusPromise
                .then((foreignStatus: Status) => {
                    const statusUri = foreignStatus.uri;
                    const statusUrl = foreignStatus.url;                    
                    return this.getInstanceInfo(account)
                        .then(instance => {
                            let version: 'v1' | 'v2' = 'v1';
                            if (instance.major >= 3) version = 'v2';
                            return this.mastodonService.search(account, statusUri, version, true)
                                .then((results: Results) => {
                                    if(results && results.statuses.length > 0) return results;
                                    return this.mastodonService.search(account, statusUrl, version, true);
                                });
                        })
                        .then((results: Results) => {
                            return results.statuses[0];
                        });
                });
        }

        return statusPromise;
    }

    getAccountFullHandle(account: Account): string {
        let fullHandle = account.acct.toLowerCase();
        if (!fullHandle.includes('@')) {
            fullHandle += `@${account.url.replace('https://', '').split('/')[0]}`;
        }
        return `@${fullHandle}`;
    }

    private emojiCache: { [id: string]: Emoji[] } = {};
    getCustomEmojis(account: AccountInfo): Promise<Emoji[]> {
        if (this.emojiCache[account.id]) {
            return Promise.resolve(this.emojiCache[account.id]);
        } else {
            return this.mastodonService.getCustomEmojis(account)
                .then(emojis => {
                    this.emojiCache[account.id] = emojis.filter(x => x.visible_in_picker);
                    return this.emojiCache[account.id];
                });
        }
    }
}

export class OpenThreadEvent {
    constructor(
        public status: Status,
        public sourceAccount: AccountInfo
    ) {
    }
}

export class InstanceInfo {
    constructor(
        public readonly type: InstanceType,
        public readonly major: number,
        public readonly minor: number) {
    }
}

export enum InstanceType {
    Mastodon = 1,
    Pleroma = 2,
    GlitchSoc = 3,
    Florence = 4,
    Pixelfed = 5
}

export class StatusWithCwPolicyResult {
    constructor(public status: Status, public applyCw: boolean, public hide: boolean) {
    }
}