import { Component, OnInit, OnDestroy } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Subscription, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { MediaService, MediaWrapper } from '../../../services/media.service';
import { ToolsService } from '../../../services/tools.service';
import { AccountInfo } from '../../../states/accounts.state';

@Component({
    selector: 'app-media',
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, OnDestroy {
    faTimes = faTimes;
    media: MediaWrapper[] = [];
    private mediaSub: Subscription;

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService,
        private readonly mediaService: MediaService) {
            
        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    ngOnInit() {
        this.mediaSub = this.mediaService.mediaSubject.subscribe((media: MediaWrapper[]) => {
            this.media = media;
        });

        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            const selectedAccount = accounts.filter(x => x.isSelected)[0];
            this.mediaService.migrateMedias(selectedAccount);
        });
    }

    ngOnDestroy(): void {
        this.mediaSub.unsubscribe();
        this.accountSub.unsubscribe();
    }

    removeMedia(media: MediaWrapper): boolean {
        this.mediaService.remove(media);
        return false;
    }

    updateMedia(media: MediaWrapper): boolean {
        const account = this.toolsService.getSelectedAccounts()[0];
        this.mediaService.update(account, media);
        return false;
    }
}
