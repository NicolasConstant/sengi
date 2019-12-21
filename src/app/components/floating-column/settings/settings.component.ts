import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Howl } from 'howler';

import { environment } from '../../../../environments/environment';
import { ToolsService } from '../../../services/tools.service';
import { UserNotificationService, NotificationSoundDefinition } from '../../../services/user-notification.service';

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


    constructor(
        private formBuilder: FormBuilder,
        private readonly toolsService: ToolsService,
        private readonly userNotificationsService: UserNotificationService) { }

    ngOnInit() {
        this.version = environment.VERSION;

        const settings =  this.toolsService.getSettings();

        this.notificationSounds = this.userNotificationsService.getAllNotificationSounds();
        this.notificationSoundId = settings.notificationSoundFileId;
        this.notificationForm = this.formBuilder.group({
            countryControl: [this.notificationSounds[this.notificationSoundId].id]
        });

        this.disableAutofocusEnabled = settings.disableAutofocus;
        this.disableAvatarNotificationsEnabled = settings.disableAvatarNotifications;
        this.disableSoundsEnabled = settings.disableSounds;
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

    onDisableAutofocusChanged(){
        let settings = this.toolsService.getSettings();
        settings.disableAutofocus = this.disableAutofocusEnabled;
        this.toolsService.saveSettings(settings);        
    }

    onDisableAvatarNotificationsChanged(){
        let settings = this.toolsService.getSettings();
        settings.disableAvatarNotifications = this.disableAvatarNotificationsEnabled;
        this.toolsService.saveSettings(settings);
    }

    onDisableSoundsEnabledChanged(){
        let settings = this.toolsService.getSettings();
        settings.disableSounds = this.disableSoundsEnabled;
        this.toolsService.saveSettings(settings);
    }

    isCleanningAll: boolean = false;
    startClearAllLocalData(): boolean {
        this.isCleanningAll = !this.isCleanningAll;
        return false;
    }

    confirmClearAll(): boolean{
        localStorage.clear();
        location.reload();
        return false;
    }

    cancelClearAll(): boolean {
        this.isCleanningAll = false;
        return false;
    }

}