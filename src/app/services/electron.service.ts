import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MyElectronService {
    detectedLangSubject = new Subject<DetectedLang[]>();

    constructor() {
        try {
            if ((<any>window).api) {
                (<any>window).api.receive("detectedLang", (data) => {
                    const result = [];
                    for (const l of data) {
                        let newLang = new DetectedLang(l[0], l[1]);
                        result.push(newLang);
                    }
                    this.detectedLangSubject.next(result);
                });
            }
        }
        catch (err) {
            console.error(err);
        }

        this.detectLang("ceci est une phrase");
    }

    setLang(lang: string) {
        try {
            if ((<any>window).api) {
                (<any>window).api.send("changeSpellchecker", lang);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    detectLang(text: string) {
        try {
            if ((<any>window).api) {
                (<any>window).api.send("detectLang", text);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}

export class DetectedLang {
    constructor(
        public lang: string,
        public score: number
    ) {}
}
