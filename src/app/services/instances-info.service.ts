import { Injectable } from '@angular/core';

import { MastodonService, VisibilityEnum } from './mastodon.service';
import { Instance, Account } from './models/mastodon.interfaces';
import { AccountInfo } from '../states/accounts.state';

@Injectable({
    providedIn: 'root'
})
export class InstancesInfoService {
    private defaultMaxChars = 500;
    private cachedMaxInstanceChar: { [id: string]: Promise<number>; } = {};
    private cachedDefaultPrivacy: { [id: string]: Promise<VisibilityEnum>; } = {};

    constructor(private mastodonService: MastodonService) { }

    getMaxStatusChars(instance: string): Promise<number> {
        if (!this.cachedMaxInstanceChar[instance]) {
            this.cachedMaxInstanceChar[instance] = this.mastodonService.getInstance(instance)
                .then((instance: Instance) => {
                    if (instance.max_toot_chars) {
                        return instance.max_toot_chars;
                    } else {
                        return this.defaultMaxChars;
                    }
                })
                .catch(() => {
                    return this.defaultMaxChars;
                });
        }
        return this.cachedMaxInstanceChar[instance];
    }

    getDefaultPrivacy(account: AccountInfo): Promise<VisibilityEnum> {
        const instance = account.instance;
        if (!this.cachedDefaultPrivacy[instance]) {
            this.cachedDefaultPrivacy[instance] = this.mastodonService.retrieveAccountDetails(account)
                .then((accountDetails: Account) => {
                    switch (accountDetails.source.privacy) {
                        case 'public':
                            return VisibilityEnum.Public;
                        case 'unlisted':
                            return VisibilityEnum.Unlisted;
                        case 'private':
                            return VisibilityEnum.Private;
                        case 'direct':
                            return VisibilityEnum.Direct;
                        default:
                            return VisibilityEnum.Public;
                    }
                })
                .catch(() => {
                    return VisibilityEnum.Public;
                });
        }
        return this.cachedDefaultPrivacy[instance];
    }
}
