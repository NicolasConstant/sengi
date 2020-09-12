import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-thankyou-tutorial',
    templateUrl: './thankyou-tutorial.component.html',
    styleUrls: ['../tutorial-enhanced.component.scss', './thankyou-tutorial.component.scss']
})
export class ThankyouTutorialComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

    follow(): boolean {
        return false;
    }
}
