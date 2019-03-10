import { Component, OnInit, OnDestroy } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { MediaService, MediaWrapper } from '../../../services/media.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-media',
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, OnDestroy {
    faTimes = faTimes;
    media: MediaWrapper[] = [];
    private mediaSub: Subscription;

    constructor(private readonly mediaService: MediaService) { }

    ngOnInit() {
        this.mediaSub = this.mediaService.mediaSubject.subscribe((media: MediaWrapper[]) => {
            this.media = media;
        });
    }

    ngOnDestroy(): void {
        this.mediaSub.unsubscribe();
    }

    removeMedia(media: MediaWrapper): boolean{
        console.warn('delete');
        console.warn(media);

        return false;
    }
}
