import { Injectable } from '@angular/core';

import { VisibilityEnum } from './mastodon.service';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { Instance, Instancev1, Instancev2, Account } from './models/mastodon.interfaces';
import { AccountInfo } from '../states/accounts.state';

@Injectable({
    providedIn: 'root'
})
export class InstancesInfoService {
    private defaultMaxChars = 500;
    private cachedMaxInstanceChar: { [id: string]: Promise<number>; } = {};
    private cachedTranslationAvailability: { [id: string]: Promise<boolean>; } = {};
    private cachedDefaultPrivacy: { [id: string]: Promise<VisibilityEnum>; } = {};

    constructor(private mastodonService: MastodonWrapperService) { }

    getMaxStatusChars(instance: string): Promise<number> {
        if (!this.cachedMaxInstanceChar[instance]) {
            this.cachedMaxInstanceChar[instance] = this.mastodonService.getInstance(instance)
                .then((instance: Instance) => {
                    if (+instance.version.split('.')[0] >= 4) {
                        const instanceV2 = <Instancev2>instance;
                        if (instanceV2
                            && instanceV2.configuration
                            && instanceV2.configuration.statuses
                            && instanceV2.configuration.statuses.max_characters)
                            return instanceV2.configuration.statuses.max_characters;
                    } else {
                        const instanceV1 = <Instancev1>instance;
                        if (instanceV1 && instanceV1.max_toot_chars)
                            return instanceV1.max_toot_chars;
                        if(instanceV1 && instanceV1.configuration && instanceV1.configuration.statuses && instanceV1.configuration.statuses.max_characters)
                            return instanceV1.configuration.statuses.max_characters;
                    }

                    return this.defaultMaxChars;
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

    getTranslationAvailability(account: AccountInfo): Promise<boolean> {
        const instance = account.instance;
        if (!this.cachedTranslationAvailability[instance]) {
            this.cachedTranslationAvailability[instance] = this.mastodonService.getInstance(instance)
                .then((instance: Instance) => {
                    if (+instance.version.split('.')[0] >= 4) {
                        const instanceV2 = <Instancev2>instance;
                        if (instanceV2
                            && instanceV2.configuration
                            && instanceV2.configuration.translation)
                            return instanceV2.configuration.translation.enabled;
                    } else {
                        const instanceV1 = <Instancev1>instance;
                        if (instanceV1 && instanceV1.max_toot_chars)
                            return false;
                    }

                    return false;
                })
                .catch(() => {
                    return false;
                });
        }
        return this.cachedTranslationAvailability[instance];
    }
}
