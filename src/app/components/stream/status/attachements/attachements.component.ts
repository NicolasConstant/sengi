import { Component, OnInit, Input } from '@angular/core';

import { Attachment } from '../../../../services/models/mastodon.interfaces';
import { NavigationService } from '../../../../services/navigation.service';
import { OpenMediaEvent } from '../../../../models/common.model';

@Component({
    selector: 'app-attachements',
    templateUrl: './attachements.component.html',
    styleUrls: ['./attachements.component.scss']
})
export class AttachementsComponent implements OnInit {
    private _attachments: Attachment[];
    isImage: boolean;
    isGifv: boolean;
    imageUrls: string[];

    @Input('attachments')
    set attachments(value: Attachment[]) {
        this._attachments = value;

        if (this._attachments[0].type === 'image') {
            this.isImage = true;
        } else if(this._attachments[0].type === 'gifv'){
            console.warn(value);
            this.isGifv = true;
        }
    }
    get attachments(): Attachment[] {
        return this._attachments;
    }

    constructor(private readonly navigationService: NavigationService) { }

    ngOnInit() {
    }

    attachmentSelected(index: number): boolean {
        let openMediaEvent = new OpenMediaEvent(index, this.attachments);
        this.navigationService.openMedia(openMediaEvent);
        return false;
    }

}
