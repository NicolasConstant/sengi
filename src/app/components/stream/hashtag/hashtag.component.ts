import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';

import { StreamElement, StreamTypeEnum, AddStream } from '../../../states/streams.state';

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.component.html',
    styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit {
    @Output() browseAccountEvent = new EventEmitter<string>();
    @Output() browseHashtagEvent = new EventEmitter<string>();

    @Input() hashtagElement: StreamElement;

    goToTopSubject: Subject<void> = new Subject<void>();

    constructor(
        private readonly store: Store) { }

    ngOnInit() {
    }

    goToTop(): boolean {
        this.goToTopSubject.next();
        return false;
    }

    addColumn(event): boolean {
        event.stopPropagation();

        const hashtag = this.hashtagElement.tag;
        const newStream = new StreamElement(StreamTypeEnum.tag, `#${hashtag}`, this.hashtagElement.accountId, hashtag, null);
        this.store.dispatch([new AddStream(newStream)]);

        return false;
    }

    browseAccount(account: string) {
        this.browseAccountEvent.next(account);
    }

    browseHashtag(hashtag: string) {
        this.browseHashtagEvent.next(hashtag);
    }
}
