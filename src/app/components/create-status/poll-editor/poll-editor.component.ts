import { Component, OnInit } from '@angular/core';
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { PollEntry } from './poll-entry/poll-entry.component';
import { PollParameters } from '../../../services/mastodon.service';
import { retry } from 'rxjs/operators';

@Component({
    selector: 'app-poll-editor',
    templateUrl: './poll-editor.component.html',
    styleUrls: ['./poll-editor.component.scss']
})
export class PollEditorComponent implements OnInit {
    faPlus = faPlus;

    private entryUuid: number = 0;
    entries: PollEntry[] = [];
    delayChoice: Delay[] = [];
    selectedId: string;
    private multiSelected: boolean;

    constructor() {
        this.entries.push(new PollEntry(this.getEntryUuid(), this.multiSelected));
        this.entries.push(new PollEntry(this.getEntryUuid(), this.multiSelected));

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
        this.entries.push(new PollEntry(this.getEntryUuid(), this.multiSelected));
        return false;
    }

    removeElement(entry: PollEntry){
        this.entries = this.entries.filter(x => x.id != entry.id);
    }

    toggleMulti() {
        this.multiSelected = !this.multiSelected;
        this.entries.forEach((e: PollEntry) => {
            e.isMulti = this.multiSelected;
        });
    }

    getPollParameters(): PollParameters {
        let params = new PollParameters();
        params.expires_in = this.delayChoice.find(x => x.id === this.selectedId).delayInSeconds;
        params.multiple = this.multiSelected;
        params.options = this.entries.map(x => x.label);
        params.hide_totals = false;
        return params;
    }
}

class Delay {
    constructor(public delayInSeconds: number, public label: string) {
        this.id = delayInSeconds.toString();
    }

    id: string;
}