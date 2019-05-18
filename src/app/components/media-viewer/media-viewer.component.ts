import { Component, OnInit, Input, Output, ElementRef, ViewChild, HostListener } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { faTimes, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
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
    faTimes = faTimes;
    faAngleLeft = faAngleLeft;
    faAngleRight = faAngleRight;

    imageUrl: string;
    gifvUrl: string;
    videoUrl: string;
    html: SafeHtml;

    previousAvailable: boolean;
    nextAvailable: boolean;
    private currentIndex: number;

    @Input('openedMediaEvent')
    set openedMediaEvent(value: OpenMediaEvent) {
        this._mediaEvent = value;

        if (value.iframe) {
            this.html = value.iframe;
            this.autoplayIframe();
        } else {
            const attachment = value.attachments[value.selectedIndex];
            this.currentIndex = value.selectedIndex;
            this.loadAttachment(attachment);
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

    private loadAttachment(attachment: Attachment) {
        if (attachment.type === 'image') {
            this.imageUrl = attachment.url;
        } else if (attachment.type === 'gifv') {
            this.gifvUrl = attachment.url;
        } else if (attachment.type === 'video') {
            this.videoUrl = attachment.url;
        }
    }

    private setBrowsing() {
        var index = this.currentIndex;
        var attachments = this.openedMediaEvent.attachments;

        console.log(`index ${index}`);
        console.log(`attachments.length ${attachments.length}`);

        if (index < attachments.length - 1) {
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
        this.imageUrl = this.openedMediaEvent.attachments[this.currentIndex].url;
        this.setBrowsing();

        return false;
    }

    next(event): boolean {
        event.stopPropagation();
        if (this.currentIndex >= this.openedMediaEvent.attachments.length - 1) return false;

        this.currentIndex++;
        this.imageUrl = this.openedMediaEvent.attachments[this.currentIndex].url;
        this.setBrowsing();

        return false;
    }
}
