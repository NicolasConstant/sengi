import { State, Action, StateContext } from '@ngxs/store';

export class RemoveUserSettings {
    static readonly type = '[Settings] Remove UserSettings';
    constructor(public accountId: string) {}
}

export class SaveUserSettings {
    static readonly type = '[Settings] Update UserSettings';
    constructor(public userSettings: UserSettings) {}
}

export class SaveSettings {
    static readonly type = '[Settings] Update UserSettings';
    constructor(public settings: GlobalSettings) {}
}

export class UserSettings {
    accountId: string;
    displayMention: boolean = true;
    displayNotifications: boolean = true;
    lastMentionReadId: string;
    lastNotificationReadId: string;
}

export class GlobalSettings {
    disableAllNotifications = false;
    userSettings: UserSettings[] = [];
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
    @Action(RemoveUserSettings)
    RemoveUserSettings(ctx: StateContext<SettingsStateModel>, action: RemoveUserSettings){
        const state = ctx.getState();
        const newSettings = new GlobalSettings();

        newSettings.disableAllNotifications = state.settings.disableAllNotifications;
        newSettings.userSettings = [...state.settings.userSettings.filter(x => x.accountId !== action.accountId)];
                  
        ctx.patchState({
            settings: newSettings
        });
    }

    @Action(SaveUserSettings)
    SaveUserSettings(ctx: StateContext<SettingsStateModel>, action: SaveUserSettings){
        const state = ctx.getState();
        const newSettings = new GlobalSettings();

        newSettings.disableAllNotifications = state.settings.disableAllNotifications;
        newSettings.userSettings = [...state.settings.userSettings.filter(x => x.accountId !== action.userSettings.accountId), action.userSettings];

        ctx.patchState({
            settings: newSettings
        });
    }

    @Action(SaveSettings)
    SaveSettings(ctx: StateContext<SettingsStateModel>, action: SaveSettings){
        const state = ctx.getState();
        const newSettings = new GlobalSettings();

        newSettings.disableAllNotifications = action.settings.disableAllNotifications;
        newSettings.userSettings = [...state.settings.userSettings];
        
        ctx.patchState({
            settings: newSettings
        });
    }
}