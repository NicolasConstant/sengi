import { Component, OnInit, Input } from '@angular/core';
import { Attachment } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-attachements',
    templateUrl: './attachements.component.html',
    styleUrls: ['./attachements.component.scss']
})
export class AttachementsComponent implements OnInit {
    private _attachments: Attachment[]; 
    isImage: boolean;
    imageUrls: string[];

    @Input('attachments')
    set attachments(value: Attachment[]) {
        this._attachments = value;

        if(this._attachments[0].type === 'image'){
            this.isImage = true;
            // this.imageUrls = this._attachments.map(x => x.url);
        }
    }
    get attachments(): Attachment[] {
        return this._attachments;
    }

    constructor() { }

    ngOnInit() {
    }

}
