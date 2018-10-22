import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-stream-overlay',
    templateUrl: './stream-overlay.component.html',
    styleUrls: ['./stream-overlay.component.scss']
})
export class StreamOverlayComponent implements OnInit {

    @Output() closeOverlay = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    close(): boolean {
        this.closeOverlay.next();
        return false;
    }

}
