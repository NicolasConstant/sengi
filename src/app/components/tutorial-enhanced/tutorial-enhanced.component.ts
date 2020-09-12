import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-tutorial-enhanced',
    templateUrl: './tutorial-enhanced.component.html',
    styleUrls: ['./tutorial-enhanced.component.scss']
})
export class TutorialEnhancedComponent implements OnInit {
    @Output() closeEvent = new EventEmitter();

    previousAvailable = false;
    nextAvailable = true;
    index = 0;
    tutorialEnded = false;
    private maxIndex = 3;

    constructor() { }

    ngOnInit() {
    }

    close(): boolean {
        this.closeEvent.next();
        return false;
    }

    previous(): boolean {
        if (this.index > 0) {
            this.index--;
            this.checkState();
        }
        return false;
    }

    next(): boolean {
        this.index++;
        this.checkState();
        return false;
    }

    private checkState() {
        if(this.index >= this.maxIndex - 1){
            this.tutorialEnded = true;
        } else {
            this.tutorialEnded = false;
        }

        if (this.index === 0) {
            this.previousAvailable = false;
        } else {
            this.previousAvailable = true;
        }

        if (this.index === this.maxIndex){
            this.close();
        }
    }
}
