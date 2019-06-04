import { Component, OnInit, Input } from '@angular/core';

import { Poll, PollOption } from '../../../../services/models/mastodon.interfaces';
import { AccountInfo } from '../../../../states/accounts.state';

@Component({
    selector: 'app-poll',
    templateUrl: './poll.component.html',
    styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
    pollName: string;    
    choiceType: string;

    private pollSelection: number[] = [];
    options: PollOptionWrapper[] = [];

    @Input() poll: Poll;
    @Input() provider: AccountInfo;

    constructor() { }

    ngOnInit() {
        this.pollName = this.poll.id;
        
        // this.poll.multiple = true;

        if(this.poll.multiple){
            this.choiceType = 'checkbox';
        } else {
            this.choiceType = 'radio';
        }

        let i = 0;
        for(let opt of this.poll.options){
            let optWrapper = new PollOptionWrapper(i, opt);
            this.options.push(optWrapper);
            i++;
        }
    }

    vote(): boolean {
        console.log(this.pollSelection);

        return false;
    }

    onSelectionChange(entry: PollOptionWrapper){
        let index = entry.id;
        if(this.poll.multiple){
            if(this.pollSelection.includes(index)){
                this.pollSelection = this.pollSelection.filter(x => x !== index);
            } else {
                this.pollSelection.push(index);
            }
        } else {
            this.pollSelection.length = 0;
            this.pollSelection.push(index);
        }
    }

}

class PollOptionWrapper implements PollOption {
    constructor(index: number, option: PollOption){
        this.id = index;
        this.title = option.title;
        this.votes_count = option.votes_count;
    }

    id: number;
    title: string;    
    votes_count: number;
}