import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AccountInfo } from '../states/accounts.state';
import { Attachment } from './models/mastodon.interfaces';
import { MastodonWrapperService } from './mastodon-wrapper.service';
import { NotificationService } from './notification.service';


@Injectable({
    providedIn: 'root'
})
export class MediaService {
    mediaSubject: BehaviorSubject<MediaWrapper[]> = new BehaviorSubject<MediaWrapper[]>([]);
    fileCache: { [url: string]: File } = {};

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonWrapperService) { }

    uploadMedia(account: AccountInfo, files: File[]) {
        for (let file of files) {
            this.postMedia(account, file);
        }
    }

    private postMedia(account: AccountInfo, file: File) {
        const uniqueId = `${file.name}${file.size}${Math.random()}`;
        const wrapper = new MediaWrapper(uniqueId, file, null);

        let medias = this.mediaSubject.value;
        medias.push(wrapper);
        if (medias.length > 4) {
            medias.splice(0, 1);
        }
        this.mediaSubject.next(medias);

        this.mastodonService.uploadMediaAttachment(account, file, null)
            .then((attachment: Attachment) => {
                this.fileCache[attachment.url] = file;
                let currentMedias = this.mediaSubject.value;
                let currentMedia = currentMedias.filter(x => x.id === uniqueId)[0];
                if (currentMedia) {
                    currentMedia.attachment = attachment;
                    this.mediaSubject.next(currentMedias);
                }
            })
            .catch((err) => {
                this.remove(wrapper);
                this.notificationService.notifyHttpError(err, account);
            });
    }

    update(account: AccountInfo, media: MediaWrapper): Promise<void> {
        if (media.attachment.description === media.description) return;

        return this.mastodonService.updateMediaAttachment(account, media.attachment.id, media.description)
            .then((att: Attachment) => {
                let medias = this.mediaSubject.value;
                let updatedMedia = medias.filter(x => x.id === media.id)[0];
                updatedMedia.attachment.description = att.description;
                this.mediaSubject.next(medias);
            })
            .catch((err) => {
                this.notificationService.notifyHttpError(err, account);
            });
    }

    async retrieveUpToDateMedia(account: AccountInfo): Promise<MediaWrapper[]> {
        const allMedia = this.mediaSubject.value;
        let allPromises: Promise<any>[] = [];
        
        for (const m of allMedia) {            
            let t = this.update(account, m);
            allPromises.push(t);
        }

        await Promise.all(allPromises);

        return allMedia;
    }

    addExistingMedia(media: MediaWrapper){
        if(!this.fileCache[media.attachment.url]) return;
        
        media.file = this.fileCache[media.attachment.url];
        let medias = this.mediaSubject.value;
        medias.push(media);
        this.mediaSubject.next(medias);
    }

    remove(media: MediaWrapper) {
        let medias = this.mediaSubject.value;
        let filteredMedias = medias.filter(x => x.id !== media.id);
        this.mediaSubject.next(filteredMedias);
    }

    clearMedia() {
        this.mediaSubject.next([]);
    }

    migrateMedias(account: AccountInfo) {
        let medias = this.mediaSubject.value;
        medias.forEach(media => {
            media.isMigrating = true;
        });
        this.mediaSubject.next(medias);

        for (let media of medias) {
            this.mastodonService.uploadMediaAttachment(account, media.file, media.description)
                .then((attachment: Attachment) => {
                    this.fileCache[attachment.url] = media.file;
                    let currentMedias = this.mediaSubject.value;
                    let currentMedia = currentMedias.filter(x => x.id === media.id)[0];
                    if (currentMedia) {
                        currentMedia.attachment = attachment;
                        currentMedia.isMigrating = false;
                        this.mediaSubject.next(currentMedias);
                    }
                })
                .catch((err) => {
                    this.remove(media);
                    this.notificationService.notifyHttpError(err, account);
                });
        }
    }
}

export class MediaWrapper {
    constructor(
        public id: string,
        public file: File,
        attachment: Attachment) {
            this.attachment = attachment;       
    }

    private _attachment: Attachment;
    public get attachment(): Attachment {
        return this._attachment;
    }

    public set attachment(value: Attachment){
        if (value && value.meta && value.meta.audio_encode) {
            this.audioType = `audio/${value.meta.audio_encode}`;
        } else if (value && value.pleroma && value.pleroma.mime_type) {
            this.audioType = value.pleroma.mime_type;
        }

        this._attachment = value;
    }

    public description: string;
    public isMigrating: boolean;
    public audioType: string;
}
