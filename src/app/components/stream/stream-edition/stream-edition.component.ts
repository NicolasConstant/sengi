import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { StreamElement, RemoveStream } from '../../../states/streams.state';

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
        console.log('move left');
        return false;
    }

    moveRight(): boolean {
        console.log('move right');
        return false;
    }

    delete(): boolean {
        console.log('delete');
        this.store.dispatch([new RemoveStream(this.streamElement.id)]);
        return false;
    }
}
