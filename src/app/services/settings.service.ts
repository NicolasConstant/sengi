import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { Account, Results, Status, Emoji } from "./models/mastodon.interfaces";
import { StatusWrapper } from '../models/common.model';
import { AccountSettings, SaveAccountSettings, GlobalSettings, SaveSettings, ContentWarningPolicy, SaveContentWarningPolicy, ContentWarningPolicyEnum, TimeLineModeEnum, TimeLineHeaderEnum } from '../states/settings.state';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    constructor(
        private readonly store: Store) { }

    getSettings(): GlobalSettings {
        let settings = <GlobalSettings>this.store.snapshot().globalsettings.settings;

        if (!settings.contentWarningPolicy) {
            var newCwPolicy = new ContentWarningPolicy();
            this.saveContentWarningPolicy(newCwPolicy);
            return <GlobalSettings>this.store.snapshot().globalsettings.settings;
        }

        if(!settings.timelineMode){
            settings.timelineMode = TimeLineModeEnum.OnTop;
            this.saveSettings(settings);
        }

        if(!settings.timelineHeader){
            settings.timelineHeader = TimeLineHeaderEnum.Title_DomainName;
            this.saveSettings(settings);
        }

        return settings;
    }

    saveSettings(settings: GlobalSettings) {
        this.store.dispatch([
            new SaveSettings(settings)
        ]);
    }

    saveContentWarningPolicy(cwSettings: ContentWarningPolicy) {
        this.store.dispatch([
            new SaveContentWarningPolicy(cwSettings)
        ]);
    }
    
    getAccountSettings(account: AccountInfo): AccountSettings {
        let accountsSettings = <AccountSettings[]>this.store.snapshot().globalsettings.settings.accountSettings;
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
        ]);
    }
}