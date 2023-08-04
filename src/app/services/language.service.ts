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
        this.settingsService.saveSettings(settings);

        this.configuredLanguagesChanged.next(settings.configuredLanguages);
    }

    removeLanguage(lang: ILanguage){
        var settings = this.settingsService.getSettings();
        settings.configuredLanguages = settings.configuredLanguages.filter(x => x.iso639 !== lang.iso639);
        this.settingsService.saveSettings(settings);

        this.configuredLanguagesChanged.next(settings.configuredLanguages);
    }

    searchLanguage(input: string): ILanguage[] {
        const avLangs = this.getAllAvaialbleLaguages();
        const found = avLangs.filter(x => x.iso639 === input || x.name.toLowerCase().includes(input.toLowerCase()));
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
