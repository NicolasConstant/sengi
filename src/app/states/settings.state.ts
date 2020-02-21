import { State, Action, StateContext, Selector, createSelector } from '@ngxs/store';

export class RemoveAccountSettings {
    static readonly type = '[Settings] Remove AccountSettings';
    constructor(public accountId: string) {}
}

export class SaveAccountSettings {
    static readonly type = '[Settings] Save AccountSettings';
    constructor(public accountSettings: AccountSettings) {}
}

export class SaveSettings {
    static readonly type = '[Settings] Save Settings';
    constructor(public settings: GlobalSettings) {}
}

export class AccountSettings {
    accountId: string;
    displayMention: boolean = true;    
    displayNotifications: boolean = true;

    disableAvatarNotifications = false;

    lastMentionCreationDate: string;    
    lastNotificationCreationDate: string;

    customStatusCharLengthEnabled: boolean = false;
    customStatusCharLength: number = 500;
}

export class GlobalSettings {
    disableAutofocus = false;
    disableAvatarNotifications = false;
    disableSounds = false;
    
    notificationSoundFileId: string = '0';

    columnSwitchingWinAlt = false;

    accountSettings: AccountSettings[] = [];
}

export interface SettingsStateModel {
    settings: GlobalSettings;
}

@State<SettingsStateModel>({
    name: 'globalsettings',
    defaults: {
        settings: new GlobalSettings()
    }
})
export class SettingsState {

    accountSettings(accountId: string){
        return createSelector([SettingsState], (state: GlobalSettings) => {
            return state.accountSettings.find(x => x.accountId === accountId);
        });
    }

    @Action(RemoveAccountSettings)
    RemoveAccountSettings(ctx: StateContext<SettingsStateModel>, action: RemoveAccountSettings){
        const state = ctx.getState();
        let newSettings = new GlobalSettings();

        newSettings = this.setGlobalSettingsValues(newSettings, state.settings);
        newSettings.accountSettings = [...state.settings.accountSettings.filter(x => x.accountId !== action.accountId)];
                  
        ctx.patchState({
            settings: newSettings
        });
    }

    @Action(SaveAccountSettings)
    SaveAccountSettings(ctx: StateContext<SettingsStateModel>, action: SaveAccountSettings){
        const state = ctx.getState();

        let newSettings = new GlobalSettings();
        newSettings = this.setGlobalSettingsValues(newSettings, state.settings);
        newSettings.accountSettings = [...state.settings.accountSettings.filter(x => x.accountId !== action.accountSettings.accountId), action.accountSettings];

        ctx.patchState({
            settings: newSettings
        });
    }

    @Action(SaveSettings)
    SaveSettings(ctx: StateContext<SettingsStateModel>, action: SaveSettings){
        const state = ctx.getState();

        let newSettings = new GlobalSettings();
        newSettings = this.setGlobalSettingsValues(newSettings, action.settings);
        newSettings.accountSettings = [...state.settings.accountSettings];        
        
        ctx.patchState({
            settings: newSettings
        });
    }

    private setGlobalSettingsValues(newSettings: GlobalSettings, oldSettings: GlobalSettings): GlobalSettings {

        newSettings.disableAutofocus = oldSettings.disableAutofocus;
        newSettings.disableAvatarNotifications = oldSettings.disableAvatarNotifications;
        newSettings.disableSounds = oldSettings.disableSounds;
        newSettings.notificationSoundFileId = oldSettings.notificationSoundFileId;
        newSettings.columnSwitchingWinAlt = oldSettings.columnSwitchingWinAlt;

        return newSettings;
    }
}