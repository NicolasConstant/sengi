import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { StatusWrapper } from '../../stream.component';
import { MastodonService } from '../../../../services/mastodon.service';
import { AccountInfo } from '../../../../states/accounts.state';

@Component({
    selector: 'app-action-bar',
    templateUrl: './action-bar.component.html',
    styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit {
    @Input() statusWrapper: StatusWrapper;

    isFavorited: boolean;
    isBoosted: boolean;
    
    isBoostLocked: boolean;
    isLocked: boolean;

    constructor(
        private readonly store: Store,
        private readonly mastodonService: MastodonService) { }

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

    private getSelectedAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts.filter(x => x.isSelected);
    }
}
