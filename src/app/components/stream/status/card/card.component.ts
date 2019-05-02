import { Component, OnInit, Input } from '@angular/core';
// import { faWindowClose, faReply, faRetweet, faStar } from "@fortawesome/free-solid-svg-icons";
import { faFileAlt } from "@fortawesome/free-regular-svg-icons";

import { Card } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
    faFileAlt = faFileAlt;

    @Input() card: Card;

    host: string;

    constructor() { }

    ngOnInit() {
        console.warn('card');
        console.warn(this.card);

        this.host = this.card.url.replace('https://', '').replace('http://', '').split('/')[0];
    }

}
