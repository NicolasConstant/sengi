import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Howl } from 'howler';

import { environment } from '../../../../environments/environment';
import { ToolsService } from '../../../services/tools.service';
import { UserNotificationService, NotificationSoundDefinition } from '../../../services/user-notification.service';
import { ServiceWorkerService } from '../../../services/service-worker.service';
import { ContentWarningPolicy, ContentWarningPolicyEnum } from '../../../states/settings.state';

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
    disableAvatarNotificationsEnabled: boolean;
    disableSoundsEnabled: boolean;
    version: string;

    columnShortcutEnabled: ColumnShortcut = ColumnShortcut.Ctrl;
    columnShortcutChanged = false;

    contentWarningPolicy: ContentWarningPolicyEnum = ContentWarningPolicyEnum.None;
    contentWarningPolicyChanged = false;

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

    constructor(
        private formBuilder: FormBuilder,
        private serviceWorkersService: ServiceWorkerService,
        private readonly toolsService: ToolsService,
        private readonly userNotificationsService: UserNotificationService) { }

    ngOnInit() {
        this.version = environment.VERSION;

        const settings = this.toolsService.getSettings();

        this.notificationSounds = this.userNotificationsService.getAllNotificationSounds();
        this.notificationSoundId = settings.notificationSoundFileId;
        this.notificationForm = this.formBuilder.group({
            countryControl: [this.notificationSounds[this.notificationSoundId].id]
        });

        this.disableAutofocusEnabled = settings.disableAutofocus;
        this.disableAvatarNotificationsEnabled = settings.disableAvatarNotifications;
        this.disableSoundsEnabled = settings.disableSounds;

        if (!settings.columnSwitchingWinAlt) {
            this.columnShortcutEnabled = ColumnShortcut.Ctrl;
        } else {
            this.columnShortcutEnabled = ColumnShortcut.Win;
        }

        this.contentWarningPolicy = settings.contentWarningPolicy.policy;
        this.addCwOnContent = settings.contentWarningPolicy.addCwOnContent.join(';');
        this.removeCwOnContent = settings.contentWarningPolicy.removeCwOnContent.join(';');
        this.contentHidedCompletely = settings.contentWarningPolicy.hideCompletlyContent.join(';');
    }

    onShortcutChange(id: ColumnShortcut) {
        this.columnShortcutEnabled = id;
        this.columnShortcutChanged = true;

        let settings = this.toolsService.getSettings();
        settings.columnSwitchingWinAlt = id === ColumnShortcut.Win;
        this.toolsService.saveSettings(settings);
    }

    onCwPolicyChange(id: ContentWarningPolicyEnum) {
        this.contentWarningPolicy = id;
        this.contentWarningPolicyChanged = true;

        this.setCwPolicy(id);
    }

    private setCwPolicy(id: ContentWarningPolicyEnum = null, addCw: string = null, removeCw: string = null, hide: string = null){
        this.contentWarningPolicyChanged = true;
        let settings = this.toolsService.getSettings();        
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
            cwPolicySettings.hideCompletlyContent = this.splitCwValues(hide);
        } else {
            cwPolicySettings.hideCompletlyContent = settings.contentWarningPolicy.hideCompletlyContent;
        }

        this.toolsService.saveContentWarningPolicy(cwPolicySettings);
    }

    private splitCwValues(data: string): string[]{
        return data.split(';').map(x => x.trim().toLowerCase()).filter((value, index, self) => self.indexOf(value) === index);
    }

    reload(): boolean {
        window.location.reload();
        return false;
    }

    onChange(soundId: string) {
        this.notificationSoundId = soundId;
        let settings = this.toolsService.getSettings()
        settings.notificationSoundFileId = soundId;
        this.toolsService.saveSettings(settings);
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
        let settings = this.toolsService.getSettings();
        settings.disableAutofocus = this.disableAutofocusEnabled;
        this.toolsService.saveSettings(settings);
    }

    onDisableAvatarNotificationsChanged() {
        let settings = this.toolsService.getSettings();
        settings.disableAvatarNotifications = this.disableAvatarNotificationsEnabled;
        this.toolsService.saveSettings(settings);
    }

    onDisableSoundsEnabledChanged() {
        let settings = this.toolsService.getSettings();
        settings.disableSounds = this.disableSoundsEnabled;
        this.toolsService.saveSettings(settings);
    }

    isCleanningAll: boolean = false;
    startClearAllLocalData(): boolean {
        this.isCleanningAll = !this.isCleanningAll;
        return false;
    }

    confirmClearAll(): boolean {
        localStorage.clear();
        location.reload();
        return false;
    }

    cancelClearAll(): boolean {
        this.isCleanningAll = false;
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
}

enum ColumnShortcut {
    Ctrl = 1,
    Win = 2
}