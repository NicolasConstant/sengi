import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';

import { StreamElement, StreamTypeEnum, AddStream } from '../../../states/streams.state';
import { OpenThreadEvent, ToolsService } from '../../../services/tools.service';
import { StreamStatusesComponent } from '../stream-statuses/stream-statuses.component';
import { AccountInfo } from '../../../states/accounts.state';

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.component.html',
    styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit {
 
    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    private _hashtagElement: StreamElement;
    @Input() 
    set hashtagElement(hashtagElement: StreamElement){
        this._hashtagElement = hashtagElement;
        this.lastUsedAccount = this.toolsService.getSelectedAccounts()[0];
    }
    get hashtagElement(): StreamElement{
        return this._hashtagElement;
    }

    @ViewChild('appStreamStatuses') appStreamStatuses: StreamStatusesComponent;

    goToTopSubject: Subject<void> = new Subject<void>();

    private lastUsedAccount: AccountInfo;

    constructor(
        private readonly store: Store,
        private readonly toolsService: ToolsService) { }

    ngOnInit() {
    }

    goToTop(): boolean {
        this.goToTopSubject.next();
        return false;
    }

    addColumn(event): boolean {
        event.stopPropagation();

        const hashtag = this.hashtagElement.tag;
        const newStream = new StreamElement(StreamTypeEnum.tag, `${hashtag}`, this.lastUsedAccount.id, hashtag, null, this.hashtagElement.displayableFullName);
        this.store.dispatch([new AddStream(newStream)]);

        return false;
    }

    refresh(): any {
        this.lastUsedAccount = this.toolsService.getSelectedAccounts()[0];
        this.appStreamStatuses.refresh();
    }

    browseAccount(account: string) {
        this.browseAccountEvent.next(account);
    }

    browseHashtag(hashtag: string) {
        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.browseThreadEvent.next(openThreadEvent);
    }
}
