import { Component, OnInit, OnDestroy } from '@angular/core';

import { MediaService, MediaWrapper } from '../../../services/media.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-media',
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, OnDestroy {
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
}
