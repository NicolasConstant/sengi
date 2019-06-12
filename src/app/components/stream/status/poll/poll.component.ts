import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { Poll, PollOption, Status } from '../../../../services/models/mastodon.interfaces';
import { AccountInfo } from '../../../../states/accounts.state';
import { MastodonService } from '../../../../services/mastodon.service';
import { NotificationService } from '../../../../services/notification.service';
import { ToolsService } from '../../../../services/tools.service';
import { StatusWrapper } from '../../../../models/common.model';

@Component({
    selector: 'app-poll',
    templateUrl: './poll.component.html',
    styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
    pollName: string;
    choiceType: string;
    pollLocked: boolean;

    private pollSelection: number[] = [];
    options: PollOptionWrapper[] = [];

    private pollPerAccountId: { [id: string]: Promise<Poll>; } = {};

    private _poll: Poll;
    @Input('poll')
    set poll(value: Poll) {
        this._poll = value;

        this.pollName = this.poll.id;

        if (this.poll.multiple) {
            this.choiceType = 'checkbox';
        } else {
            this.choiceType = 'radio';
        }

        this.options.length = 0;
        const maxVotes = Math.max(...this.poll.options.map(x => x.votes_count));
        let i = 0;
        for (let opt of this.poll.options) {
            let optWrapper = new PollOptionWrapper(i, opt, this.poll.votes_count, opt.votes_count === maxVotes);
            this.options.push(optWrapper);
            i++;
        }
    }
    get poll(): Poll {
        return this._poll;
    }

    @Input() provider: AccountInfo;
    @Input() status: Status;

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    private selectedAccount: AccountInfo;

    constructor(
        private readonly store: Store,
        private notificationService: NotificationService,
        private toolsService: ToolsService,
        private mastodonService: MastodonService) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        this.pollPerAccountId[this.provider.id] = Promise.resolve(this.poll);

        this.selectedAccount = this.provider;

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.checkStatus(accounts);
        });
    }

    private checkStatus(accounts: AccountInfo[]): void {
        this.pollLocked = false;
        var newSelectedAccount = accounts.find(x => x.isSelected);

        const accountChanged = this.selectedAccount.id !== newSelectedAccount.id;
        if (accountChanged && !this.pollPerAccountId[newSelectedAccount.id] && this.status.visibility === 'public') {
            this.setStatsAtZero();

            this.pollPerAccountId[newSelectedAccount.id] = this.toolsService.getStatusUsableByAccount(newSelectedAccount, new StatusWrapper(this.status, this.provider))
                .then((status: Status) => {
                    console.warn(status);
                    return this.mastodonService.getPoll(newSelectedAccount, status.poll.id);
                })
                .then((poll: Poll) => {
                    this.poll = poll;
                    return poll;
                })
                .catch(err => {
                    this.notificationService.notifyHttpError(err);
                    return null;
                });
        } else if (this.status.visibility !== 'public') {            
            this.pollLocked = true;
        } else {
            this.pollPerAccountId[newSelectedAccount.id]
                .then((poll: Poll) => {
                    this.poll = poll;
                })
                .catch(err => this.notificationService.notifyHttpError(err));
        }
        this.selectedAccount = newSelectedAccount;
    }


    vote(): boolean {
        const selectedAccount = this.selectedAccount;
        const pollPromise = this.pollPerAccountId[selectedAccount.id];

        pollPromise
            .then((poll: Poll) => {
                return this.mastodonService.voteOnPoll(selectedAccount, poll.id, this.pollSelection);
            })
            .then((poll: Poll) => {
                this.poll = poll;
                this.pollPerAccountId[selectedAccount.id] = Promise.resolve(poll);
            })
            .catch(err => this.notificationService.notifyHttpError(err));
        return false;
    }

    private setStatsAtZero() {
        this.options.forEach(p => {
            p.votes_count = 0;
            p.percentage = '0';
        });
    }

    refresh(): boolean {
        this.setStatsAtZero();

        const selectedAccount = this.selectedAccount;
        const pollPromise = this.pollPerAccountId[selectedAccount.id];

        pollPromise
            .then((poll: Poll) => {
                return this.mastodonService.getPoll(selectedAccount, poll.id);
            })
            .then((poll: Poll) => {
                this.poll = poll;
                this.pollPerAccountId[selectedAccount.id] = Promise.resolve(poll);
            })
            .catch(err => this.notificationService.notifyHttpError(err));

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