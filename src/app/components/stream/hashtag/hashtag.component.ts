import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'app-hashtag',
    templateUrl: './hashtag.component.html',
    styleUrls: ['./hashtag.component.scss']
})
export class HashtagComponent implements OnInit {
    hashtag: string;    

    @Output() browseAccount = new EventEmitter<string>();
    @Output() browseHashtag = new EventEmitter<string>();

    @Input('currentHashtag')
    set currentAccount(hashtag: string) {
        this.hashtag = hashtag;
    }

    constructor() { }

    ngOnInit() {
    }

}
