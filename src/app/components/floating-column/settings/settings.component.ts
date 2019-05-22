import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    version: string;

    constructor() { }

    ngOnInit() {
        this.version = environment.VERSION;
    }
}