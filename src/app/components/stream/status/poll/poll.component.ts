import { Component, OnInit, Input } from '@angular/core';

import { Poll } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-poll',
    templateUrl: './poll.component.html',
    styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
    // choiceType: string = 'radio';
    choiceType: string = 'checkbox';

    @Input() poll: Poll;

    constructor() { }

    ngOnInit() {

    }

}
