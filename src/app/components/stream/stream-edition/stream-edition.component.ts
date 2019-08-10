import { Component, OnInit, Input, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngxs/store';
import { faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";

import { StreamElement, RemoveStream, MoveStreamUp, MoveStreamDown, UpdateStream } from '../../../states/streams.state';

@Component({
    selector: 'app-stream-edition',
    templateUrl: './stream-edition.component.html',
    styleUrls: ['./stream-edition.component.scss']
})
export class StreamEditionComponent implements OnInit {
    faChevronLeft = faChevronLeft;
    faChevronRight = faChevronRight;
    faTimes = faTimes;

    hideBoosts: boolean;
    hideReplies: boolean;
    hideBots: boolean;

    private init: boolean;

    @Input() streamElement: StreamElement;

    @Output('closed') public closedEvent = new EventEmitter();

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (!this.init) return;

        if (!this.eRef.nativeElement.contains(event.target)) {
            this.closedEvent.emit(null);
        }
    }

    constructor(
        private readonly store: Store,
        private eRef: ElementRef) { }

    ngOnInit() {
        this.hideBoosts = this.streamElement.hideBoosts;
        this.hideReplies = this.streamElement.hideReplies;
        this.hideBots = this.streamElement.hideBots;

        setTimeout(() => {
            this.init = true;
        }, 0);
    }

    settingsChanged(): boolean {
        this.streamElement.hideBoosts = this.hideBoosts;
        this.streamElement.hideReplies = this.hideReplies;
        this.streamElement.hideBots = this.hideBots;

        this.store.dispatch([new UpdateStream(this.streamElement)]);
        return false;
    }

    moveLeft(): boolean {
        this.store.dispatch([new MoveStreamUp(this.streamElement.id)]);
        return false;
    }

    moveRight(): boolean {
        this.store.dispatch([new MoveStreamDown(this.streamElement.id)]);
        return false;
    }

    delete(): boolean {
        this.store.dispatch([new RemoveStream(this.streamElement.id)]);
        return false;
    }
}
