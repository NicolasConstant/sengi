import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { StatusWrapper } from '../../../../models/common.model';
import { ILanguage } from '../../../../states/settings.state';
import { LanguageService } from '../../../../services/language.service';
import { InstancesInfoService } from '../../../../services/instances-info.service';

@Component({
    selector: 'app-status-translate',
    templateUrl: './status-translate.component.html',
    styleUrls: ['./status-translate.component.scss']
})
export class StatusTranslateComponent implements OnInit, OnDestroy {

    private languageSub: Subscription;
    private languagesSub: Subscription;

    selectedLanguage: ILanguage;
    configuredLanguages: ILanguage[] = [];

    isTranslationAvailable: boolean;

    @Input() status: StatusWrapper;

    constructor(
        private readonly languageService: LanguageService,
        private readonly instancesInfoService: InstancesInfoService,
    ) { }

    ngOnInit() {
        this.languageSub = this.languageService.selectedLanguageChanged.subscribe(l => {
            if (l) {
                this.selectedLanguage = l;
                this.analyseAvailability();
            }
        });

        this.languagesSub = this.languageService.configuredLanguagesChanged.subscribe(l => {
            if (l) {
                this.configuredLanguages = l;
                this.analyseAvailability();
            }
        });
    }

    private analyseAvailability() {
        this.instancesInfoService.getTranslationAvailability(this.status.provider)
            .then(canTranslate => {                
                if (canTranslate
                    && this.configuredLanguages.length > 0
                    && this.configuredLanguages.findIndex(x => x.iso639 === this.status.status.language) === -1) {

                        console.warn('can translate');
                    this.isTranslationAvailable = true;
                }
                else {
                    this.isTranslationAvailable = false;
                }
            })
            .catch(err => {
                console.error(err);
                this.isTranslationAvailable = false;
            });
    }

    ngOnDestroy(): void {
        if (this.languageSub) this.languageSub.unsubscribe();
        if (this.languagesSub) this.languagesSub.unsubscribe();
    }
}
