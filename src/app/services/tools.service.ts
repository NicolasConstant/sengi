import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { Account, Results, Status, Emoji, Instancev2, Instancev1 } from "./models/mastodon.interfaces";
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
            || (cwPolicy.hideCompletlyContent && cwPolicy.hideCompletlyContent.length > 0)) {
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

        if (cwPolicy.hideCompletlyContent && cwPolicy.hideCompletlyContent.length > 0) {
            let detected = cwPolicy.hideCompletlyContent.filter(x => splittedContent.find(y => y == x || y == `#${x}`));
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
                    const splittedVersion = instance.version.split('.');
                    let major = +splittedVersion[0];
                    let minor = +splittedVersion[1];

                    let altMajor = 0;
                    let altMinor = 0;

                    let type = InstanceType.Mastodon;

                    const version = instance.version.toLowerCase();

                    if (version.includes('pleroma')) {
                        type = InstanceType.Pleroma;

                        const pleromaVersion = version.split('pleroma ')[1].split('.');
                        altMajor = +pleromaVersion[0];
                        altMinor = +pleromaVersion[1];

                    } else if (version.includes('+glitch')) {
                        type = InstanceType.GlitchSoc;
                    } else if (version.includes('+florence')) {
                        type = InstanceType.Florence;
                    } else if (version.includes('pixelfed')) {
                        type = InstanceType.Pixelfed;
                    } else if (version.includes('takahe')) {
                        type = InstanceType.Takahe;
                        major = 1; //FIXME: when a clearer set of feature are available
                        minor = 0; //FIXME: when a clearer set of feature are available

                        const takaheVersion = version.split('takahe/')[1].split('.');
                        altMajor = +takaheVersion[0];
                        altMinor = +takaheVersion[1];

                    } else if (version.includes('akkoma')) {
                        type = InstanceType.Akkoma;

                        const akkomaVersion = version.split('akkoma ')[1].split('.');
                        altMajor = +akkomaVersion[0];
                        altMinor = +akkomaVersion[1];
                    }

                    let streamingApi = "";

                    if (major >= 4) {
                        const instanceV2 = <Instancev2>instance;

                        if (instanceV2
                            && instanceV2.configuration
                            && instanceV2.configuration.urls)
                            streamingApi = instanceV2.configuration.urls.streaming;
                    } else {
                        const instanceV1 = <Instancev1>instance;
                        if (instanceV1 && instanceV1.urls)
                            streamingApi = instanceV1.urls.streaming_api;
                    }

                    let instanceInfo = new InstanceInfo(type, major, minor, streamingApi, altMajor, altMinor);
                    this.instanceInfos[acc.instance] = instanceInfo;

                    return instanceInfo;
                });
        }
    }

    isBookmarksAreAvailable(account: AccountInfo): Promise<boolean> {
        return this.getInstanceInfo(account)
            .then((instance: InstanceInfo) => {
                if (instance.major == 3 && instance.minor >= 1 
                    || instance.major > 3
                    || instance.type === InstanceType.Pleroma && instance.altMajor >= 2 && instance.altMinor >= 5
                    || instance.type === InstanceType.Akkoma && instance.altMajor >= 3 && instance.altMinor >= 9
                    || instance.type === InstanceType.Takahe && instance.altMajor >= 0 && instance.altMinor >= 9) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch(err => {
                console.error(err);
                return false;
            });
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
        public readonly minor: number,
        public readonly streamingApi: string,
        public readonly altMajor: number,
        public readonly altMinor: number) {
    }
}

export enum InstanceType {
    Mastodon = 1,
    Pleroma = 2, // "2.7.2 (compatible; Pleroma 2.5.1)"
    GlitchSoc = 3, // "4.1.5+glitch_0801_3b49b5a"
    Florence = 4,
    Pixelfed = 5,
    Takahe = 6, // "takahe/0.9.0"
    Akkoma = 7, // 	"2.7.2 (compatible; Akkoma 3.9.2-develop)"
}

export class StatusWithCwPolicyResult {
    constructor(public status: Status, public applyCw: boolean, public hide: boolean) {
    }
}