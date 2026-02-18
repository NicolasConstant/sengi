import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faLink, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

import { SettingsService } from '../../../../../services/settings.service';
import { Attachment } from '../../../../../services/models/mastodon.interfaces';
import { StatusWrapper } from '../../../../../models/common.model';
import { OpenThreadEvent } from '../../../../../services/tools.service';

@Component({
    selector: 'app-attachement-image',
    templateUrl: './attachement-image.component.html',
    styleUrls: ['./attachement-image.component.scss']
})
export class AttachementImageComponent implements OnInit {
    faLink = faLink;
    faExternalLinkAlt = faExternalLinkAlt;
    displayAltLabel: boolean;

    @Input() attachment: Attachment;
    @Input() status: StatusWrapper;
    @Output() openEvent = new EventEmitter();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

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

    openStatus(): boolean {
        if(!this.status) return false;

        const openThreadEvent = new OpenThreadEvent(this.status.status, this.status.provider);
        this.browseThreadEvent.next(openThreadEvent);

        return false;
    }
}
