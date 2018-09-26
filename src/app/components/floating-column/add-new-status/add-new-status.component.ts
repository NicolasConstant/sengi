import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';
import { AccountInfo } from '../../../states/accounts.state';
import { MastodonService } from '../../../services/mastodon.service';
import { Status } from '../../../services/models/mastodon.interfaces';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-new-status',
    templateUrl: './add-new-status.component.html',
    styleUrls: ['./add-new-status.component.scss']
})
export class AddNewStatusComponent implements OnInit {
    @Input() titleHandle: string;  
    @Input() statusHandle: string;       
    
    constructor(private readonly store: Store,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
    }

    onSubmit(): boolean {
        const accounts = this.getRegisteredAccounts();
        const selectedAccounts = accounts.filter(x => x.isSelected);

        console.warn(`selectedAccounts ${selectedAccounts.length}`);
        console.warn(`statusHandle ${this.statusHandle}`);

        for (const acc of selectedAccounts) {
            this.mastodonService.postNewStatus(acc, this.statusHandle)
                .then((res: Status) => {
                    console.log(res);
                });
        }

        return false;
    }

    private getRegisteredAccounts(): AccountInfo[] {
        var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        return regAccounts;
    }
}
