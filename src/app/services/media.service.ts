import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AccountInfo } from '../states/accounts.state';
import { Attachment } from './models/mastodon.interfaces';
import { MastodonService } from './mastodon.service';
import { NotificationService } from './notification.service';


@Injectable({
    providedIn: 'root'
})
export class MediaService {
    mediaSubject: BehaviorSubject<MediaWrapper[]> = new BehaviorSubject<MediaWrapper[]>([]);

    constructor(
        private readonly notificationService: NotificationService,
        private readonly mastodonService: MastodonService) { }

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
        this.mediaSubject.next(medias);

        this.mastodonService.uploadMediaAttachment(account, file, null)
            .then((attachment: Attachment) => {
                let currentMedias = this.mediaSubject.value;
                let currentMedia = currentMedias.filter(x => x.id === uniqueId)[0];
                if (currentMedia) {
                    currentMedia.attachment = attachment;
                    this.mediaSubject.next(currentMedias);
                }
            })
            .catch((err) => {
                this.remove(wrapper);
                this.notificationService.notifyHttpError(err);
            });
    }

    update(account: AccountInfo, media: MediaWrapper) {
        if (media.attachment.description === media.description) return;

        this.mastodonService.updateMediaAttachment(account, media.attachment.id, media.description)
            .then((att: Attachment) => {
                let medias = this.mediaSubject.value;
                let updatedMedia = medias.filter(x => x.id === media.id)[0];
                updatedMedia.attachment.description = att.description;
                this.mediaSubject.next(medias);
            })
            .catch((err) => {
                this.notificationService.notifyHttpError(err);
            });
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
                    this.notificationService.notifyHttpError(err);
                });
        }
    }
}

export class MediaWrapper {
    constructor(
        public id: string,
        public file: File,
        public attachment: Attachment) { }

    public description: string;
    public isMigrating: boolean;
}
