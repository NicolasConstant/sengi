import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { Account, Results, Status, Emoji } from "./models/mastodon.interfaces";
import { StatusWrapper } from '../models/common.model';
import { AccountSettings, SaveAccountSettings } from '../states/settings.state';

@Injectable({
    providedIn: 'root'
})
export class ToolsService {
    private accountAvatar: { [id: string]: string; } = {};
    private instanceInfos: { [id: string]: InstanceInfo } = {};

    constructor(
        private readonly mastodonService: MastodonWrapperService,
        private readonly store: Store) { }

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
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts.filter(x => x.isSelected);
    }

    getAccountSettings(account: AccountInfo): AccountSettings {
        var accountsSettings = <AccountSettings[]>this.store.snapshot().globalsettings.settings.accountSettings;
        let accountSettings = accountsSettings.find(x => x.accountId === account.id);
        if (!accountSettings) {
            accountSettings = new AccountSettings();
            accountSettings.accountId = account.id;
            this.saveAccountSettings(accountSettings);
        }
        if (!accountSettings.customStatusCharLength) {
            accountSettings.customStatusCharLength = 500;
            this.saveAccountSettings(accountSettings);
        }
        return accountSettings;
    }

    saveAccountSettings(accountSettings: AccountSettings) {
        this.store.dispatch([
            new SaveAccountSettings(accountSettings)
        ])
    }

    findAccount(account: AccountInfo, accountName: string): Promise<Account> {
        return this.getInstanceInfo(account)
            .then(instance => {
                let version: 'v1' | 'v2' = 'v1';
                if (instance.major >= 3) version = 'v2';
                return this.mastodonService.search(account, accountName, version, true);
            })
            .then((result: Results) => {
                if (accountName[0] === '@') accountName = accountName.substr(1);

                const foundAccount = result.accounts.find(
                    x => (x.acct.toLowerCase() === accountName.toLowerCase()
                        ||
                        (x.acct.toLowerCase().split('@')[0] === accountName.toLowerCase().split('@')[0])
                        && x.url.replace('https://', '').split('/')[0] === accountName.toLowerCase().split('@')[1])
                );
                return foundAccount;
            });
    }

    getStatusUsableByAccount(account: AccountInfo, originalStatus: StatusWrapper): Promise<Status> {
        const isProvider = originalStatus.provider.id === account.id;

        let statusPromise: Promise<Status> = Promise.resolve(originalStatus.status);

        if (!isProvider) {
            statusPromise = statusPromise
                .then((foreignStatus: Status) => {
                    const statusUrl = foreignStatus.url;
                    return this.getInstanceInfo(account)
                        .then(instance => {
                            let version: 'v1' | 'v2' = 'v1';
                            if (instance.major >= 3) version = 'v2';
                            return this.mastodonService.search(account, statusUrl, version, true);
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