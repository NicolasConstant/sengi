import { State, Action, StateContext, Selector, createSelector } from '@ngxs/store';

export class RemoveAccountSettings {
    static readonly type = '[Settings] Remove AccountSettings';
    constructor(public accountId: string) {}
}

export class SaveContentWarningPolicy {
    static readonly type = '[Settings] Save ContentWarningPolicy';
    constructor(public contentWarningPolicy: ContentWarningPolicy) {}
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

export enum ContentWarningPolicyEnum {
    None = 1, 
    HideAll = 2,
    AddOnAllContent = 3
}

export enum TimeLineModeEnum {
    OnTop = 1,
    Continuous = 2,
    SlowMode = 3
}

export enum TimeLineHeaderEnum {
    Title_DomainName = 1,
    Title_Username_DomainName = 2,
    Title_AccountIcon_DomainName = 3,
    Title_AccountIcon = 4,
    Title = 5
}

export class ContentWarningPolicy {
    policy: ContentWarningPolicyEnum = ContentWarningPolicyEnum.None;
    addCwOnContent: string[] = [];
    removeCwOnContent: string[] = [];
    hideCompletelyContent: string[] = [];
}

export class GlobalSettings {
    disableAutofocus = false;
    disableAvatarNotifications = false;
    disableSounds = false;
    disableRemoteStatusFetching = false;
    autoFollowOnListEnabled = false;
    twitterBridgeEnabled = false;

    notificationSoundFileId: string = '0';
    twitterBridgeInstance: string = '';

    timelineHeader: TimeLineHeaderEnum = TimeLineHeaderEnum.Title_DomainName;
    timelineMode: TimeLineModeEnum = TimeLineModeEnum.OnTop;

    contentWarningPolicy: ContentWarningPolicy = new ContentWarningPolicy();

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
        newSettings.contentWarningPolicy = state.settings.contentWarningPolicy;
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
        newSettings.contentWarningPolicy = state.settings.contentWarningPolicy;
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
        newSettings.contentWarningPolicy = state.settings.contentWarningPolicy;
        newSettings.accountSettings = [...state.settings.accountSettings];        
        
        ctx.patchState({
            settings: newSettings
        });
    }

    @Action(SaveContentWarningPolicy)
    SaveContentWarningPolicy(ctx: StateContext<SettingsStateModel>, action: SaveContentWarningPolicy){
        const state = ctx.getState();

        let newSettings = new GlobalSettings();

        newSettings = this.setGlobalSettingsValues(newSettings, state.settings);
        newSettings.accountSettings = [...state.settings.accountSettings];
        newSettings.contentWarningPolicy = action.contentWarningPolicy;

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
        newSettings.disableRemoteStatusFetching = oldSettings.disableRemoteStatusFetching;
        newSettings.timelineHeader = oldSettings.timelineHeader;
        newSettings.timelineMode = oldSettings.timelineMode;
        newSettings.autoFollowOnListEnabled = oldSettings.autoFollowOnListEnabled;
        newSettings.twitterBridgeEnabled = oldSettings.twitterBridgeEnabled;
        newSettings.twitterBridgeInstance = oldSettings.twitterBridgeInstance;

        return newSettings;
    }
}