import { Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

import { OpenThreadEvent } from '../../services/tools.service';

export abstract class BrowseBase implements OnInit, OnDestroy {

    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();
    @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

    abstract ngOnInit();
    abstract ngOnDestroy();
      
    browseAccount(accountName: string): void {
        this.browseAccountEvent.next(accountName);
    }

    browseHashtag(hashtag: string): void {
        this.browseHashtagEvent.next(hashtag);
    }

    browseThread(openThreadEvent: OpenThreadEvent): void {
        this.browseThreadEvent.next(openThreadEvent);
    }
}