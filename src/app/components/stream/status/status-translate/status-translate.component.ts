import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { StatusWrapper } from '../../../../models/common.model';
import { ILanguage } from '../../../../states/settings.state';
import { LanguageService } from '../../../../services/language.service';
import { InstancesInfoService } from '../../../../services/instances-info.service';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { Translation } from '../../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-status-translate',
    templateUrl: './status-translate.component.html',
    styleUrls: ['./status-translate.component.scss']
})
export class StatusTranslateComponent implements OnInit, OnDestroy {

    private languageSub: Subscription;
    private languagesSub: Subscription;
    private loadedTranslation: Translation;

    selectedLanguage: ILanguage;
    configuredLanguages: ILanguage[] = [];

    isTranslationAvailable: boolean;
    showTranslationButton: boolean = true;
    translatedBy: string;

    @Input() status: StatusWrapper;
    @Output() translation = new EventEmitter<Translation>();

    constructor(
        private readonly mastodonWrapperService: MastodonWrapperService,
        private readonly languageService: LanguageService,
        private readonly instancesInfoService: InstancesInfoService,
        private readonly notificationService: NotificationService
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

    ngOnDestroy(): void {
        if (this.languageSub) this.languageSub.unsubscribe();
        if (this.languagesSub) this.languagesSub.unsubscribe();
    }

    private analyseAvailability() {
        this.instancesInfoService.getTranslationAvailability(this.status.provider)
            .then(canTranslate => {                
                if (canTranslate
                    && !this.status.isRemote
                    && this.status.status.language
                    && this.configuredLanguages.length > 0
                    && this.configuredLanguages.findIndex(x => x.iso639 === this.status.status.language) === -1) {

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

    translate(): boolean {
        if(this.loadedTranslation){
            this.translation.next(this.loadedTranslation);
            this.showTranslationButton = false;
            return false;
        }

        this.mastodonWrapperService.translate(this.status.provider, this.status.status.id, this.selectedLanguage.iso639)
            .then(x => {
                this.loadedTranslation = x;  
                this.translation.next(x);
                this.translatedBy = x.provider;
                this.showTranslationButton = false;
            })
            .catch((err: HttpErrorResponse) => {
                console.error(err);
                this.notificationService.notifyHttpError(err, this.status.provider);
            });
        return false;
    }

    revertTranslation(): boolean {
        let revertTranslate: Translation;
        revertTranslate = {
            content: this.status.status.content,
            language: this.loadedTranslation.detected_source_language,
            detected_source_language: this.loadedTranslation.language,
            provider: this.loadedTranslation.provider,
            spoiler_text: this.status.status.spoiler_text
        };
        this.translation.next(revertTranslate);

        this.showTranslationButton = true;
        return false;
    }
}
