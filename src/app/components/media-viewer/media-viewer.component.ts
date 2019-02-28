import { Component, OnInit, Input, Output } from '@angular/core';
import { faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Subject } from 'rxjs';

import { OpenMediaEvent } from '../../models/common.model';
import { Attachment } from '../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-media-viewer',
    templateUrl: './media-viewer.component.html',
    styleUrls: ['./media-viewer.component.scss']
})
export class MediaViewerComponent implements OnInit {
    private _mediaEvent: OpenMediaEvent;

    faChevronLeft = faChevronLeft;
    faChevronRight = faChevronRight;
    faTimes = faTimes;
    imageUrl: string;
    
    @Input('openedMediaEvent')
    set openedMediaEvent(value: OpenMediaEvent) {
        this._mediaEvent = value;

        const attachment = value.attachments[value.selectedIndex];
        this.loadAttachment(attachment);
    }
    get openedMediaEvent(): OpenMediaEvent {
        return this._mediaEvent;
    }

    @Output() closeSubject = new Subject<boolean>();

    constructor() { }

    ngOnInit() {
    }

    private loadAttachment(attachment: Attachment) {
        console.warn('attachment');
        console.warn(attachment);

        if (attachment.type === 'image') {
            this.imageUrl = attachment.url;
        }
    }


    close(): boolean {
        console.warn('xclose media');
        this.closeSubject.next(true);
        return false;
    }
}
