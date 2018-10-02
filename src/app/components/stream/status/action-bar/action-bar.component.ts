import { Component, OnInit, Input } from '@angular/core';
import { StatusWrapper } from '../../stream.component';

@Component({
    selector: 'app-action-bar',
    templateUrl: './action-bar.component.html',
    styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit {
    @Input() statusWrapper: StatusWrapper;

    isFavorited: boolean;
    isBoosted: boolean;

    constructor() { }

    ngOnInit() {
    }

    reply(): boolean {
        console.warn('reply');
        return false;
    }

    boost(): boolean {
        console.warn('boost');
        this.isBoosted = !this.isBoosted;
        return false;
    }

    favorite(): boolean {
        console.warn('favorite');
        this.isFavorited = !this.isFavorited;
        return false;
    }

    more(): boolean {
        console.warn('more');
        return false;
    }
}
