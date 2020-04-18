import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { faPlay, faPause, faExpand, faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";

import { Attachment, PleromaAttachment } from '../../../../services/models/mastodon.interfaces';
import { NavigationService } from '../../../../services/navigation.service';
import { OpenMediaEvent } from '../../../../models/common.model';

@Component({
    selector: 'app-attachements',
    templateUrl: './attachements.component.html',
    styleUrls: ['./attachements.component.scss']
})
export class AttachementsComponent implements OnInit {    
    imageAttachments: Attachment[] = [];
    videoAttachments: Attachment[] = [];
    audioAttachments: AudioAttachment[] = [];

    private _attachments: Attachment[];

    faPlay = faPlay;
    faPause = faPause;
    faExpand = faExpand;
    faVolumeUp = faVolumeUp;
    faVolumeMute = faVolumeMute;

    isPlaying: boolean = false;
    isMuted: boolean = false;

    audioType: string;

    @Input('attachments')
    set attachments(value: Attachment[]) {
        this._attachments = value;
        this.setAttachments(value);
    }
    get attachments(): Attachment[] {
        return this._attachments;
    }

    @ViewChild('videoPlayer') videoplayer: ElementRef;

    constructor(private readonly navigationService: NavigationService) { }

    ngOnInit() {
    }

    private setAttachments(att: Attachment[]){
        att.forEach(a => {
            if(a.type === 'image' || a.type === 'gifv'){
                this.imageAttachments.push(a);
            } else if(a.type === 'video') {
                this.videoAttachments.push(a);                
            } else if(a.type === 'audio') {
                this.audioAttachments.push(new AudioAttachment(a));
            }
        });
    }

    attachmentSelected(type: 'image' | 'video', index: number): boolean {
        let openMediaEvent: OpenMediaEvent;
        if(type === 'image'){
            openMediaEvent = new OpenMediaEvent(index, this.imageAttachments, null);
        } else if(type === 'video') {
            openMediaEvent = new OpenMediaEvent(index, this.videoAttachments, null);
        }

        this.navigationService.openMedia(openMediaEvent);
        return false;
    }

    private getVideo(): HTMLVideoElement {
        return this.videoplayer.nativeElement;
    }

    onPlay(): boolean {
        if (!this.isPlaying) {
            this.getVideo().play();
        } else {
            this.getVideo().pause();
        }

        this.isPlaying = !this.isPlaying;
        return false;
    }

    onExpand(): boolean {
        if (!this.isMuted) {
            this.onMute();
        }

        if (this.isPlaying) {
            this.onPlay();
        }

        this.attachmentSelected('video', 0);
        return false;
    }

    onMute(): boolean {        
        this.isMuted = !this.isMuted;
        this.getVideo().muted = this.isMuted;
        return false;
    }

    
}

class AudioAttachment implements Attachment {
    constructor(att: Attachment){
        this.id = att.id;
        this.type = att.type;
        this.url = att.url;
        this.remote_url = att.remote_url;
        this.preview_url = att.preview_url;
        this.text_url = att.text_url;
        this.meta = att.meta;
        this.description = att.description;
        this.pleroma = att.pleroma;

        this.setAudioData(att);
    }

    setAudioData(att: Attachment): any {
        if(att.meta && att.meta.audio_encode){
            this.audioType = `audio/${att.meta.audio_encode}`;
        } else if(att.pleroma && att.pleroma.mime_type){
            this.audioType = att.pleroma.mime_type;
        }
    }

    id: string;
    type: "image" | "video" | "gifv" | "audio";
    url: string;
    remote_url: string;
    preview_url: string;
    text_url: string;
    meta: any;
    description: string;
    pleroma: PleromaAttachment;

    audioType: string;
}