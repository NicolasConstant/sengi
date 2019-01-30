import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { StreamElement, RemoveStream, MoveStreamUp, MoveStreamDown } from '../../../states/streams.state';

@Component({
    selector: 'app-stream-edition',
    templateUrl: './stream-edition.component.html',
    styleUrls: ['./stream-edition.component.scss']
})
export class StreamEditionComponent implements OnInit {
    @Input() streamElement: StreamElement;

    constructor(private readonly store: Store) { }

    ngOnInit() {
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
