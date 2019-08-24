import { Component, OnInit } from '@angular/core';

import { PollEntry } from './poll-entry/poll-entry.component';

@Component({
    selector: 'app-poll-editor',
    templateUrl: './poll-editor.component.html',
    styleUrls: ['./poll-editor.component.scss']
})
export class PollEditorComponent implements OnInit {

    private entryUuid: number = 0;
    entries: PollEntry[] = [];
    delayChoice: Delay[] = [];
    selectedId: string;

    constructor() {
        this.entries.push(new PollEntry(this.getEntryUuid()));
        this.entries.push(new PollEntry(this.getEntryUuid()));

        this.delayChoice.push(new Delay(60 * 5, "5 minutes"));
        this.delayChoice.push(new Delay(60 * 30, "30 minutes"));
        this.delayChoice.push(new Delay(60 * 60, "1 hour"));
        this.delayChoice.push(new Delay(60 * 60 * 6, "6 hours"));
        this.delayChoice.push(new Delay(60 * 60 * 24, "1 day"));
        this.delayChoice.push(new Delay(60 * 60 * 24 * 3, "3 days"));
        this.delayChoice.push(new Delay(60 * 60 * 24 * 7, "7 days"));
        this.delayChoice.push(new Delay(60 * 60 * 24 * 15, "15 days"));
        this.delayChoice.push(new Delay(60 * 60 * 24 * 30, "30 days"));

        this.selectedId = this.delayChoice[4].id;
    }

    ngOnInit() {

    }

    private getEntryUuid(): number {
        this.entryUuid++;
        return this.entryUuid;
    }

    addEntry(): boolean {
        this.entries.push(new PollEntry(this.getEntryUuid()));
        return false;
    }

    removeElement(entry: PollEntry){
        this.entries = this.entries.filter(x => x.id != entry.id);
    }
}

class Delay {
    constructor(public delayInSeconds: number, public label: string) {
        this.id = delayInSeconds.toString();
    }

    id: string;
}