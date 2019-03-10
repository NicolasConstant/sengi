import { Component, OnInit, OnDestroy } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Subscription } from 'rxjs';

import { MediaService, MediaWrapper } from '../../../services/media.service';
import { ToolsService } from '../../../services/tools.service';

@Component({
    selector: 'app-media',
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, OnDestroy {
    faTimes = faTimes;
    media: MediaWrapper[] = [];
    private mediaSub: Subscription;

    constructor(
        private readonly toolsService: ToolsService,
        private readonly mediaService: MediaService) { }

    ngOnInit() {
        this.mediaSub = this.mediaService.mediaSubject.subscribe((media: MediaWrapper[]) => {
            this.media = media;
        });
    }

    ngOnDestroy(): void {
        this.mediaSub.unsubscribe();
    }

    removeMedia(media: MediaWrapper): boolean {
        this.mediaService.remove(media);
        return false;
    }

    updateMedia(media: MediaWrapper): boolean {
        const account = this.toolsService.getSelectedAccounts()[0];
        this.mediaService.update(account, media);
        return false;
    }
}
