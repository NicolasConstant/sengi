import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faLink } from "@fortawesome/free-solid-svg-icons";

import { SettingsService } from '../../../../../services/settings.service';
import { Attachment } from '../../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-attachement-image',
    templateUrl: './attachement-image.component.html',
    styleUrls: ['./attachement-image.component.scss']
})
export class AttachementImageComponent implements OnInit {
    faLink = faLink;
    displayAltLabel: boolean;

    @Input() attachment: Attachment;
    @Output() openEvent = new EventEmitter();

    constructor(
        private readonly settingsService: SettingsService
    ) { 
        this.displayAltLabel = this.settingsService.getSettings().enableAltLabel;
    }

    ngOnInit() {
    }

    attachmentSelected(): boolean {
        this.openEvent.next();
        return false;
    }

    openExternal(): boolean {
        window.open(this.attachment.url, '_blank');
        return false;
    }
}
