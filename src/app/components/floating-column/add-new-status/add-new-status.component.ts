import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-add-new-status',
    templateUrl: './add-new-status.component.html',
    styleUrls: ['./add-new-status.component.scss']
})
export class AddNewStatusComponent implements OnInit {
    @Input() titleHandle: string;
    @Input() statusHandle: string;

    constructor() { }

    ngOnInit() {
    }

    onSubmit(): boolean{
        return false;
    }
}
