import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ILanguage } from '../states/settings.state';
import { SettingsService } from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    configuredLanguagesChanged = new BehaviorSubject<ILanguage[]>([]);
    selectedLanguageChanged = new BehaviorSubject<ILanguage>(null);

    constructor(private settingsService: SettingsService) {
        this.configuredLanguagesChanged.next(this.getConfiguredLanguages());
        this.selectedLanguageChanged.next(this.getSelectedLanguage());
    }

    getSelectedLanguage(): ILanguage {
        const lang = this.settingsService.getSettings().selectedLanguage;
        return lang;
    }

    setSelectedLanguage(lang: ILanguage): void {
        var settings = this.settingsService.getSettings();
        settings.selectedLanguage = lang;
        this.settingsService.saveSettings(settings);

        this.selectedLanguageChanged.next(lang);
    }

    getConfiguredLanguages(): ILanguage[] {
        const langs = this.settingsService.getSettings().configuredLanguages;
        return langs;
    }

    addLanguage(lang: ILanguage){
        var settings = this.settingsService.getSettings();
        settings.configuredLanguages.push(lang);
        settings.configuredLanguages.sort((a, b) => a.name.localeCompare(b.name));
        this.settingsService.saveSettings(settings);
        
        this.configuredLanguagesChanged.next(settings.configuredLanguages);

        if(settings.configuredLanguages.length === 1){
            this.setSelectedLanguage(lang);
        }
    }

    removeLanguage(lang: ILanguage){
        var settings = this.settingsService.getSettings();
        settings.configuredLanguages = settings.configuredLanguages.filter(x => x.iso639 !== lang.iso639);
        this.settingsService.saveSettings(settings);

        this.configuredLanguagesChanged.next(settings.configuredLanguages);

        if(this.getSelectedLanguage().iso639 === lang.iso639){
            if(settings.configuredLanguages.length > 0){
                this.setSelectedLanguage(settings.configuredLanguages[0]);
            } else {
                this.setSelectedLanguage(null);
            }
        }
    }

    searchLanguage(input: string): ILanguage[] {
        const avLangs = this.getAllAvaialbleLaguages();
        let found = avLangs.filter(x => x.name.toLowerCase().includes(input.toLowerCase()) || x.iso639.toLowerCase().includes(input.toLowerCase()));
        found.sort((a, b) => a.name.localeCompare(b.name));
        found = found.slice(0, 5);
        return found;
    }

    private getAllAvaialbleLaguages(): Language[] {
        //TODO: Add more languages
        return [
            new Language("en", "English"),
            new Language("fr", "French"),
            new Language("de", "German")
        ];
    }
}

export class Language {    
    constructor(public iso639: string, public name: string){
    }
}
