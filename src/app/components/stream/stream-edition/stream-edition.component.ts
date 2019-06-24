import { Component, OnInit, Input } from '@angular/core';
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

    @Input() streamElement: StreamElement;

    constructor(private readonly store: Store) { }

    ngOnInit() {
        this.hideBoosts = this.streamElement.hideBoosts;
        this.hideReplies = this.streamElement.hideReplies;
        this.hideBots = this.streamElement.hideBots;
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
