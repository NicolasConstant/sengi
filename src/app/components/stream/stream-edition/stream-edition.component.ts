import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-stream-edition',
    templateUrl: './stream-edition.component.html',
    styleUrls: ['./stream-edition.component.scss']
})
export class StreamEditionComponent implements OnInit {

    constructor() { }

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
        return false;
    }
}
