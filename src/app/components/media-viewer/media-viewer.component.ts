import { Component, OnInit, Input, Output, ElementRef, ViewChild } from '@angular/core';
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

    @Input('openedMediaEvent')
    set openedMediaEvent(value: OpenMediaEvent) {
        this._mediaEvent = value;

        if (value.iframe) {
            this.html = value.iframe;
            this.autoplayIframe();
        } else {
            const attachment = value.attachments[value.selectedIndex];
            this.loadAttachment(attachment);
        }
    }
    get openedMediaEvent(): OpenMediaEvent {
        return this._mediaEvent;
    }

    @Output() closeSubject = new Subject<boolean>();
    @ViewChild('video') myVideo: ElementRef;

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

    private autoplayIframe(): any {
        setTimeout(() => {
            if(this.myVideo.nativeElement.childNodes[0].src.includes('?')){
                this.myVideo.nativeElement.childNodes[0].src+='&autoplay=1&auto_play=1';
            } else {
                this.myVideo.nativeElement.childNodes[0].src+='?autoplay=1&auto_play=1';
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

    previous(event): boolean{
        event.stopPropagation();

        return false;
    }

    next(event): boolean{
        event.stopPropagation();

        return false;
    }
}
