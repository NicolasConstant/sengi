import { Component, OnInit, Input } from '@angular/core';

import { Poll, PollOption } from '../../../../services/models/mastodon.interfaces';
import { AccountInfo } from '../../../../states/accounts.state';
import { MastodonService } from '../../../../services/mastodon.service';
import { NotificationService } from '../../../../services/notification.service';

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

    constructor(
        private notificationService: NotificationService,
        private mastodonService: MastodonService) { }

    ngOnInit() {
        this.pollName = this.poll.id;

        //this.poll.multiple = true;

        if (this.poll.multiple) {
            this.choiceType = 'checkbox';
        } else {
            this.choiceType = 'radio';
        }

        const maxVotes = Math.max(...this.poll.options.map(x => x.votes_count));
        let i = 0;
        for (let opt of this.poll.options) {
            let optWrapper = new PollOptionWrapper(i, opt, this.poll.votes_count, opt.votes_count === maxVotes);
            this.options.push(optWrapper);
            i++;
        }
    }

    vote(): boolean {
        this.mastodonService.voteOnPoll(this.provider, this.poll.id, this.pollSelection)
            .then((poll: Poll) => {
                this.poll = poll;
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            });
        return false;
    }

    onSelectionChange(entry: PollOptionWrapper) {
        let index = entry.id;
        if (this.poll.multiple) {
            if (this.pollSelection.includes(index)) {
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
    constructor(index: number, option: PollOption, totalVotes: number, isMax: boolean) {
        this.id = index;
        this.title = option.title;
        this.votes_count = option.votes_count;
        if (totalVotes === 0) {
            this.percentage = '0';
        } else {
            this.percentage = ((this.votes_count / totalVotes) * 100).toFixed(0);
        }
        this.isMax = isMax;
    }

    id: number;
    title: string;
    votes_count: number;
    percentage: string;
    isMax: boolean;
}