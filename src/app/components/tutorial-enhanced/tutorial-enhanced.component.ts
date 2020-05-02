import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-tutorial-enhanced',
    templateUrl: './tutorial-enhanced.component.html',
    styleUrls: ['./tutorial-enhanced.component.scss']
})
export class TutorialEnhancedComponent implements OnInit {

    @Output() closeEvent = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    close(): boolean {
        this.closeEvent.next();
        return false;
    }

}
