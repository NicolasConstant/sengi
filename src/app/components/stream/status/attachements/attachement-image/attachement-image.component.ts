import { Component, OnInit, Input } from '@angular/core';

import { Attachment } from '../../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-attachement-image',
    templateUrl: './attachement-image.component.html',
    styleUrls: ['./attachement-image.component.scss']
})
export class AttachementImageComponent implements OnInit {

    @Input() attachment: Attachment;

    constructor() { }

    ngOnInit() {
    }

}
