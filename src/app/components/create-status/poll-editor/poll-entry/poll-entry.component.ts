import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-poll-entry',
    templateUrl: './poll-entry.component.html',
    styleUrls: ['./poll-entry.component.scss']
})
export class PollEntryComponent implements OnInit {
    @Input() entry: PollEntry;

    constructor() { }

    ngOnInit() {
    }

    remove(): boolean { 
        
        return false;
    }

}

export class PollEntry {
    public isMulti: boolean;
    public entry: string;
}