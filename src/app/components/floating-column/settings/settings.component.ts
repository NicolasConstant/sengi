import { Component, OnInit } from '@angular/core';
const { version: appVersion } = require('../../../../../package.json')

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


export const environment = {
    VERSION: require('../../../../../package.json').version
};