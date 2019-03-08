import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

import { AccountInfo } from '../states/accounts.state';
import { ApiRoutes } from './models/api.settings';
import { Attachment } from './models/mastodon.interfaces';


@Injectable({
    providedIn: 'root'
})
export class MediaService {
    private apiRoutes = new ApiRoutes();

    mediaSubject: BehaviorSubject<MediaWrapper[]> = new BehaviorSubject<MediaWrapper[]>([]);

    constructor(private readonly httpClient: HttpClient) { }

    uploadMedia(files: File[], account: AccountInfo){
        for (let file of files) {
            this.postMedia(file, account);
        }      
    }

    private postMedia(file: File, account: AccountInfo){
        const uniqueId = `${file.name}${file.size}${Math.random()}`;
        const wrapper = new MediaWrapper(uniqueId, file, null);

        let medias = this.mediaSubject.value;
        medias.push(wrapper);
        this.mediaSubject.next(medias);

        let input = new FormData();
        input.append('file', file);
        const route = `https://${account.instance}${this.apiRoutes.uploadMediaAttachment}`;
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${account.token.access_token}` });
        this.httpClient.post(route, input, { headers: headers }).toPromise()
            .then((attachment: Attachment) => {
                let currentMedias = this.mediaSubject.value;
                let currentMedia = currentMedias.filter(x => x.id === uniqueId)[0];
                if(currentMedia){
                    currentMedia.attachment = attachment;
                    this.mediaSubject.next(currentMedias);
                }
            })
            .catch((err)=>{
                let currentMedias = this.mediaSubject.value;
                let currentMedia = currentMedias.filter(x => x.id !== uniqueId);
                this.mediaSubject.next(currentMedia);

                //TODO: notify
            });
    }
}

export class MediaWrapper {
    constructor(
        public id: string,
        public file: File, 
        public attachment: Attachment) {}
}
