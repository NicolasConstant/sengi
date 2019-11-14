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

    version: string;
    notificationSounds: NotificationSoundDefinition[];
    notificationSoundId: string;
    notificationForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private readonly toolsService: ToolsService,
        private readonly userNotificationsService: UserNotificationService) { }

    ngOnInit() {
        this.version = environment.VERSION;

        this.notificationSounds = this.userNotificationsService.getAllNotificationSounds();
        this.notificationSoundId = this.toolsService.getSettings().notificationSoundFileId;
        this.notificationForm = this.formBuilder.group({
            countryControl: [this.notificationSounds[this.notificationSoundId].id]
        });
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
}