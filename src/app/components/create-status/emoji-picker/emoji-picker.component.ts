import { Component, OnInit, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-emoji-picker',
    templateUrl: './emoji-picker.component.html',
    styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent implements OnInit {
    private init = false;

    @Output('closed') public closedEvent = new EventEmitter();

    constructor(private eRef: ElementRef) { }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (!this.init) return;

        if (!this.eRef.nativeElement.contains(event.target)) {          
            this.closedEvent.emit(null);
        }
    }

    ngOnInit() {
        setTimeout(() => {
            this.init = true;
        }, 0);
    }
}
