import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'app-poll-entry',
    templateUrl: './poll-entry.component.html',
    styleUrls: ['./poll-entry.component.scss']
})
export class PollEntryComponent implements OnInit {
    faTimes = faTimes;

    @Input() entry: PollEntry;

    @Output() removeEvent = new EventEmitter();
    @Output() toggleMultiEvent = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    remove(): boolean { 
        this.removeEvent.next();
        return false;
    }

    toggleMulti(): boolean {
        this.toggleMultiEvent.next();
        return false;
    }

}

export class PollEntry {
    constructor(public id: number, public isMulti: boolean) {        
    }
    
    public label: string;
}