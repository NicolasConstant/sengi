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
    lastMentionCreationDate: string;    
    lastNotificationCreationDate: string;

    customStatusCharLengthEnabled: boolean = false;
    customStatusCharLength: number = 500;
}

export class GlobalSettings {
    disableAllNotifications = false;
    notificationSoundFileId: string = '0';
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
        const newSettings = new GlobalSettings();

        newSettings.disableAllNotifications = state.settings.disableAllNotifications;
        newSettings.accountSettings = [...state.settings.accountSettings.filter(x => x.accountId !== action.accountId)];
                  
        ctx.patchState({
            settings: newSettings
        });
    }

    @Action(SaveAccountSettings)
    SaveAccountSettings(ctx: StateContext<SettingsStateModel>, action: SaveAccountSettings){
        const state = ctx.getState();
        const newSettings = new GlobalSettings();

        newSettings.disableAllNotifications = state.settings.disableAllNotifications;
        newSettings.accountSettings = [...state.settings.accountSettings.filter(x => x.accountId !== action.accountSettings.accountId), action.accountSettings];

        ctx.patchState({
            settings: newSettings
        });
    }

    @Action(SaveSettings)
    SaveSettings(ctx: StateContext<SettingsStateModel>, action: SaveSettings){
        const state = ctx.getState();
        const newSettings = new GlobalSettings();

        newSettings.disableAllNotifications = action.settings.disableAllNotifications;
        newSettings.notificationSoundFileId = action.settings.notificationSoundFileId;
        newSettings.accountSettings = [...state.settings.accountSettings];        
        
        ctx.patchState({
            settings: newSettings
        });
    }
}