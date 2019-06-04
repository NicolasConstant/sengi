import { Component, OnInit, Input } from '@angular/core';

import { Poll } from '../../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-poll',
    templateUrl: './poll.component.html',
    styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
    pollName: string;

    choiceType: string;// = 'radio';
    //choiceType: string = 'checkbox';

    @Input() poll: Poll;

    constructor() { }

    ngOnInit() {
        this.pollName = this.poll.id;
        if(this.poll.multiple){
            this.choiceType = 'checkbox';
        } else {
            this.choiceType = 'radio';
        }
    }

}
