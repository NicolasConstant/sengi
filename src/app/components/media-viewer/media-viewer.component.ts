import { Component, OnInit, Input, Output, ElementRef, ViewChild, HostListener } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { faTimes, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Subject } from 'rxjs';

import { OpenMediaEvent } from '../../models/common.model';
import { Attachment, PleromaAttachment } from '../../services/models/mastodon.interfaces';


@Component({
    selector: 'app-media-viewer',
    templateUrl: './media-viewer.component.html',
    styleUrls: ['./media-viewer.component.scss']
})
export class MediaViewerComponent implements OnInit {
    private _mediaEvent: OpenMediaEvent;
    faTimes = faTimes;
    faAngleLeft = faAngleLeft;
    faAngleRight = faAngleRight;

    attachments: AttachmentsWrapper[] = [];
    html: SafeHtml;

    previousAvailable: boolean;
    nextAvailable: boolean;
    currentIndex: number;

    @Input('openedMediaEvent')
    set openedMediaEvent(value: OpenMediaEvent) {
        this._mediaEvent = value;

        this.attachments.length = 0;

        if (value.iframe) {
            this.html = value.iframe;
            this.autoplayIframe();
        } else {

            for(let i = 0; i < value.attachments.length; i++){
                let att = value.attachments[i];
                this.attachments.push(new AttachmentsWrapper(att, i));
            }

            this.currentIndex = value.selectedIndex;
            this.setBrowsing();
        }
    }
    get openedMediaEvent(): OpenMediaEvent {
        return this._mediaEvent;
    }

    @Output() closeSubject = new Subject<boolean>();
    @ViewChild('video') myVideo: ElementRef;

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        event.stopPropagation();
        event.preventDefault();

        if (event.key === 'ArrowRight') {
            this.next(event);
        } else if (event.key === 'ArrowLeft') {
            this.previous(event);
        }
    }

    constructor() { }

    ngOnInit() {
    }

    private setBrowsing() {
        var index = this.currentIndex;

        if (index < this.attachments.length - 1) {
            this.nextAvailable = true;
        } else {
            this.nextAvailable = false;
        }

        if (index > 0) {
            this.previousAvailable = true;
        } else {
            this.previousAvailable = false;
        }
    }

    private autoplayIframe(): any {
        setTimeout(() => {
            if (this.myVideo.nativeElement.childNodes[0].src.includes('?')) {
                this.myVideo.nativeElement.childNodes[0].src += '&autoplay=1&auto_play=1';
            } else {
                this.myVideo.nativeElement.childNodes[0].src += '?autoplay=1&auto_play=1';
            }
        }, 500);
    }

    close(): boolean {
        this.closeSubject.next(true);
        return false;
    }

    blockClick(event: any): boolean {
        event.stopPropagation();
        return false;
    }

    previous(event): boolean {
        event.stopPropagation();
        if (this.currentIndex <= 0) return false;

        this.currentIndex--;
        this.setBrowsing();

        return false;
    }

    next(event): boolean {
        event.stopPropagation();
        if (this.currentIndex >= this.openedMediaEvent.attachments.length - 1) return false;

        this.currentIndex++;
        this.setBrowsing();

        return false;
    }
}

class AttachmentsWrapper implements Attachment {
    constructor(attachment: Attachment, index: number) {
        this.id = attachment.id;
        this.type = attachment.type;
        this.url = attachment.url;
        this.remote_url = attachment.remote_url;
        this.preview_url = attachment.preview_url;
        this.text_url = attachment.text_url;
        this.meta = attachment.meta;
        this.description = attachment.description;
        this.pleroma = attachment.pleroma;

        this.index = index;
    }

    id: string;
    type: "image" | "video" | "gifv";
    url: string;
    remote_url: string;
    preview_url: string;
    text_url: string;
    meta: any;
    description: string;  
    pleroma: PleromaAttachment;

    index: number;
}
