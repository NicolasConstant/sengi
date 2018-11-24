import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { StreamElement } from '../../../states/streams.state';


@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.component.html',
    styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit {
    @Output() browseAccount = new EventEmitter<string>();
    @Output() browseHashtag = new EventEmitter<string>();

    @Input() hashtagElement: StreamElement;

    goToTopSubject: Subject<void> = new Subject<void>();

    constructor() { }

    ngOnInit() {
    }

    goToTop(): boolean{
        this.goToTopSubject.next();
        return false;
    }

    addColumn(event): boolean {
        event.stopPropagation();
        console.log(`add column ${this.hashtagElement.tag}`)

        return false;        
    }

    selectAccount(account: string) {
        this.browseAccount.next(account);
    }

    selectHashtag(hashtag: string) {
        this.browseHashtag.next(hashtag);
    }
}
