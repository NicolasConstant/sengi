import { Component, OnInit, Input } from '@angular/core';

import { Card } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

    @Input() card: Card;

    host: string;

    constructor() { }

    ngOnInit() {
        console.warn('card');
        console.warn(this.card);

        this.host = this.card.url.replace('https://', '').replace('http://', '').split('/')[0];
    }

}
