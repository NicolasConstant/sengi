import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { AccountInfo } from '../../states/accounts.state';
import { StreamElement } from '../../states/streams.state';

@Component({
    selector: 'app-tutorial',
    templateUrl: './tutorial.component.html',
    styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit, OnDestroy {   
    public showAddAccount: boolean;
    public showOpenAccount: boolean;

    private hasAccounts: boolean;
    private hasColumns: boolean;

    @Select(state => state.streamsstatemodel.streams) streamElements$: Observable<StreamElement[]>;
    @Select(state => state.registeredaccounts.accounts) accounts$: Observable<AccountInfo[]>;

    private accountsSub: Subscription;
    private steamsSub: Subscription;

    constructor() {
    }

    ngOnInit() {
        this.accountsSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            if (accounts) {
                if (accounts.length === 0) {
                    this.showAddAccount = true;
                    this.showOpenAccount = false;
                } else {
                    this.hasAccounts = true;
                    this.showAddAccount = false;

                    if (!this.hasColumns) {
                        this.showOpenAccount = true;
                    }
                }
            }
        });

        this.steamsSub = this.streamElements$.subscribe((streams: StreamElement[]) => {
            if (streams) {
                if (streams.length === 0 && this.hasAccounts) {
                    this.showOpenAccount = true;
                } else if(streams.length > 0 && this.hasAccounts){
                    this.hasColumns = true;
                    this.showOpenAccount = false;
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.accountsSub.unsubscribe();
        this.steamsSub.unsubscribe();
    }
}
