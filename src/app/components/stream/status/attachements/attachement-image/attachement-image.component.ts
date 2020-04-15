import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Attachment } from '../../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-attachement-image',
    templateUrl: './attachement-image.component.html',
    styleUrls: ['./attachement-image.component.scss']
})
export class AttachementImageComponent implements OnInit {
    @Input() attachment: Attachment;
    @Output() openEvent = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    attachmentSelected(): boolean {
        this.openEvent.next();
        return false;
    }
}
