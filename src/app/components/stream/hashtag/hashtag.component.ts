import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { StreamElement } from '../../../states/streams.state';


@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.component.html',
    styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit {
    hashtag: string;

    @Output() browseAccount = new EventEmitter<string>();
    @Output() browseHashtag = new EventEmitter<string>();

    @Input() hashtagElement: StreamElement;

    @Input('currentHashtag')
    set currentAccount(hashtag: string) {
        this.hashtag = hashtag;
    }

    goToTopSubject: Subject<void> = new Subject<void>();

    constructor() { }

    ngOnInit() {
    }

}
