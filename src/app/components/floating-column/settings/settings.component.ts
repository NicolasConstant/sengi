import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Howl } from 'howler';

import { environment } from '../../../../environments/environment';
import { ToolsService, InstanceType } from '../../../services/tools.service';
import { UserNotificationService, NotificationSoundDefinition } from '../../../services/user-notification.service';
import { ServiceWorkerService } from '../../../services/service-worker.service';
import { ContentWarningPolicy, ContentWarningPolicyEnum, TimeLineModeEnum, TimeLineHeaderEnum } from '../../../states/settings.state';
import { NotificationService } from '../../../services/notification.service';
import { NavigationService } from '../../../services/navigation.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {

    notificationSounds: NotificationSoundDefinition[];
    notificationSoundId: string;
    notificationForm: FormGroup;

    disableAutofocusEnabled: boolean;
    disableRemoteStatusFetchingEnabled: boolean;
    disableAvatarNotificationsEnabled: boolean;
    disableSoundsEnabled: boolean;
    version: string;

    hasPleromaAccount: boolean;
    autoFollowOnListEnabled: boolean;

    twitterBridgeEnabled: boolean;

    columnShortcutEnabled: ColumnShortcut = ColumnShortcut.Ctrl;
    timeLineHeader: TimeLineHeaderEnum = TimeLineHeaderEnum.Title_DomainName;
    timeLineMode: TimeLineModeEnum = TimeLineModeEnum.OnTop;
    contentWarningPolicy: ContentWarningPolicyEnum = ContentWarningPolicyEnum.None;

    private addCwOnContent: string;
    set setAddCwOnContent(value: string) {
        this.setCwPolicy(null, value, null, null);
        this.addCwOnContent = value.trim();
    }
    get setAddCwOnContent(): string {
        return this.addCwOnContent;
    }

    private removeCwOnContent: string;
    set setRemoveCwOnContent(value: string) {
        this.setCwPolicy(null, null, value, null);
        this.removeCwOnContent = value.trim();
    }
    get setRemoveCwOnContent(): string {
        return this.removeCwOnContent;
    }

    private contentHidedCompletely: string;
    set setContentHidedCompletely(value: string) {
        this.setCwPolicy(null, null, null, value);
        this.contentHidedCompletely = value.trim();
    }
    get setContentHidedCompletely(): string {
        return this.contentHidedCompletely;
    }

    private twitterBridgeInstance: string;
    set setTwitterBridgeInstance(value: string) {
        let instance = value.replace('https://', '').replace('http://', '').replace('/', '').trim();
        this.setBridgeInstance(instance);
        this.twitterBridgeInstance = instance;
    }
    get setTwitterBridgeInstance(): string {
        return this.twitterBridgeInstance;
    }

    constructor(
        private readonly settingsService: SettingsService,
        private readonly navigationService: NavigationService,
        private formBuilder: FormBuilder,
        private serviceWorkersService: ServiceWorkerService,
        private readonly toolsService: ToolsService,
        private readonly notificationService: NotificationService,
        private readonly userNotificationsService: UserNotificationService) { }

    ngOnInit() {
        this.version = environment.VERSION;

        const settings = this.settingsService.getSettings();

        this.notificationSounds = this.userNotificationsService.getAllNotificationSounds();
        this.notificationSoundId = settings.notificationSoundFileId;
        this.notificationForm = this.formBuilder.group({
            countryControl: [this.notificationSounds[this.notificationSoundId].id]
        });

        this.disableAutofocusEnabled = settings.disableAutofocus;
        this.disableAvatarNotificationsEnabled = settings.disableAvatarNotifications;
        this.disableSoundsEnabled = settings.disableSounds;
        this.disableRemoteStatusFetchingEnabled = settings.disableRemoteStatusFetching;

        if (!settings.columnSwitchingWinAlt) {
            this.columnShortcutEnabled = ColumnShortcut.Ctrl;
        } else {
            this.columnShortcutEnabled = ColumnShortcut.Win;
        }

        this.contentWarningPolicy = settings.contentWarningPolicy.policy;
        this.addCwOnContent = settings.contentWarningPolicy.addCwOnContent.join(';');
        this.removeCwOnContent = settings.contentWarningPolicy.removeCwOnContent.join(';');
        this.contentHidedCompletely = settings.contentWarningPolicy.hideCompletelyContent.join(';');

        this.timeLineHeader = settings.timelineHeader;
        this.timeLineMode = settings.timelineMode;

        this.autoFollowOnListEnabled = settings.autoFollowOnListEnabled;
        const accs =  this.toolsService.getAllAccounts();
        accs.forEach(a => {
            this.toolsService.getInstanceInfo(a)
            .then(ins => {
                if(ins.type === InstanceType.Pleroma){
                    this.hasPleromaAccount = true;
                }
            })
            .catch(err => console.error(err));
        });

        this.twitterBridgeEnabled = settings.twitterBridgeEnabled;
        this.twitterBridgeInstance = settings.twitterBridgeInstance;
    }

    onShortcutChange(id: ColumnShortcut) {
        this.columnShortcutEnabled = id;
        this.notifyRestartNeeded();

        let settings = this.settingsService.getSettings();
        settings.columnSwitchingWinAlt = id === ColumnShortcut.Win;
        this.settingsService.saveSettings(settings);
    }

    onTimeLineHeaderChange(id: TimeLineHeaderEnum){
        this.timeLineHeader = id;
        this.notifyRestartNeeded();

        let settings = this.settingsService.getSettings();
        settings.timelineHeader = id;
        this.settingsService.saveSettings(settings);
    }

    onTimeLineModeChange(id: TimeLineModeEnum){
        this.timeLineMode = id;
        this.notifyRestartNeeded();

        let settings = this.settingsService.getSettings();
        settings.timelineMode = id;
        this.settingsService.saveSettings(settings);
    }

    onCwPolicyChange(id: ContentWarningPolicyEnum) {
        this.contentWarningPolicy = id;
        this.notifyRestartNeeded();

        this.setCwPolicy(id);
    }

    private setCwPolicy(id: ContentWarningPolicyEnum = null, addCw: string = null, removeCw: string = null, hide: string = null){
        this.notifyRestartNeeded();
        let settings = this.settingsService.getSettings();        
        let cwPolicySettings = new ContentWarningPolicy();

        if(id !== null){
            cwPolicySettings.policy = id;
        } else {
            cwPolicySettings.policy = settings.contentWarningPolicy.policy;
        }

        if(addCw !== null){
            cwPolicySettings.addCwOnContent = this.splitCwValues(addCw);
        } else {
            cwPolicySettings.addCwOnContent = settings.contentWarningPolicy.addCwOnContent;
        }

        if(removeCw !== null){
            cwPolicySettings.removeCwOnContent = this.splitCwValues(removeCw);
        } else {
            cwPolicySettings.removeCwOnContent = settings.contentWarningPolicy.removeCwOnContent;
        }

        if(hide !== null){
            cwPolicySettings.hideCompletelyContent = this.splitCwValues(hide);
        } else {
            cwPolicySettings.hideCompletelyContent = settings.contentWarningPolicy.hideCompletelyContent;
        }

        this.settingsService.saveContentWarningPolicy(cwPolicySettings);
    }   

    private splitCwValues(data: string): string[]{
        return data.split(';').map(x => x.trim().toLowerCase()).filter((value, index, self) => self.indexOf(value) === index).filter(y => y !== '');
    }

    private setBridgeInstance(instance: string){
        let settings = this.settingsService.getSettings();
        settings.twitterBridgeInstance = instance;
        this.settingsService.saveSettings(settings);
    }

    // reload(): boolean {
    //     window.location.reload();
    //     return false;
    // }

    onChange(soundId: string) {
        this.notificationSoundId = soundId;
        let settings = this.settingsService.getSettings()
        settings.notificationSoundFileId = soundId;
        this.settingsService.saveSettings(settings);
    }

    playNotificationSound(): boolean {
        let soundData = this.notificationSounds.find(x => x.id === this.notificationSoundId);

        let sound = new Howl({
            src: [soundData.path]
        });
        sound.play();

        return false;
    }

    onDisableAutofocusChanged() {
        this.notifyRestartNeeded();
        let settings = this.settingsService.getSettings();
        settings.disableAutofocus = this.disableAutofocusEnabled;
        this.settingsService.saveSettings(settings);
    }

    onDisableRemoteStatusFetchingChanged() {
        this.notifyRestartNeeded();
        let settings = this.settingsService.getSettings();
        settings.disableRemoteStatusFetching = this.disableRemoteStatusFetchingEnabled;
        this.settingsService.saveSettings(settings);
    }

    onDisableAvatarNotificationsChanged() {
        this.notifyRestartNeeded();
        let settings = this.settingsService.getSettings();
        settings.disableAvatarNotifications = this.disableAvatarNotificationsEnabled;
        this.settingsService.saveSettings(settings);
    }

    onDisableSoundsEnabledChanged() {
        let settings = this.settingsService.getSettings();
        settings.disableSounds = this.disableSoundsEnabled;
        this.settingsService.saveSettings(settings);
    }

    onAutoFollowOnListChanged(){
        let settings = this.settingsService.getSettings();
        settings.autoFollowOnListEnabled = this.autoFollowOnListEnabled;
        this.settingsService.saveSettings(settings);
    }

    onTwitterBridgeEnabledChanged(){
        let settings = this.settingsService.getSettings();
        settings.twitterBridgeEnabled = this.twitterBridgeEnabled;
        this.settingsService.saveSettings(settings);
    }

    isCleaningAll: boolean = false;
    startClearAllLocalData(): boolean {
        this.isCleaningAll = !this.isCleaningAll;
        return false;
    }

    confirmClearAll(): boolean {
        localStorage.clear();
        location.reload();
        return false;
    }

    cancelClearAll(): boolean {
        this.isCleaningAll = false;
        return false;
    }

    isCheckingUpdates = false;
    checkForUpdates(): boolean {
        this.isCheckingUpdates = true;
        this.serviceWorkersService.checkForUpdates()
            .catch(err => {
                console.error(err);
            })
            .then(() => {
                this.isCheckingUpdates = false;
            });
        return false;
    }

    notifyRestartNeeded(){
        this.notificationService.notifyRestartNotification('Reload to apply changes');
    }

    openTutorial(): boolean {
        localStorage.setItem('tutorial', JSON.stringify(false));
        this.navigationService.closePanel();
        return false;
    }
}

enum ColumnShortcut {
    Ctrl = 1,
    Win = 2
}