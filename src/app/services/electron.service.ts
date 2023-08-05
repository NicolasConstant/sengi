import { Injectable } from '@angular/core';
// import { ElectronService } from 'ngx-electron';
import { ipcRenderer, webFrame } from 'electron';

@Injectable({
    providedIn: 'root'
})
export class MyElectronService {
    ipcRenderer: typeof ipcRenderer;


    private isHostedInElectron: boolean;

    constructor() {
        //this.isHostedInElectron = window && window.process && (<any>window.process).type;
        // console.warn(`isHostedInElectron ${this.isHostedInElectron}`);

        // if(process){
        //     console.warn(process.versions['electron']);
        // }

        try {
            //console.warn(`electron: ${this.electronService.isElectronApp}`);
            //console.warn(this.electronService);

            //this.electronService.ipcRenderer.send('ping', 'toto');


            //this.ipcRenderer.send('ping', 'toto');
        }
        catch (err) {
            console.error(err);
        }

    }

    setLang(lang: string) {
        try {
            (<any>window).api.send("toMain", lang);
        }
        catch (err) {
            console.error(err);
        }
    }
}
