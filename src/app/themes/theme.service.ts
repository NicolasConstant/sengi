import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Theme, lightTheme, defaultTheme, ThemeTypeEnum } from "./theme";
import { SettingsService } from '../services/settings.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private active: Theme = defaultTheme;
    private availableThemes: Theme[] = [defaultTheme, lightTheme];

    activeTheme = new BehaviorSubject<ThemeTypeEnum>(ThemeTypeEnum.default);

    constructor(private readonly settingsService: SettingsService) {
        let settings = settingsService.getSettings();

        if(!settings.selectedTheme){
            settings.selectedTheme = 0;
            settingsService.saveSettings(settings);
        }

        const selectedTheme = this.availableThemes.find(x => x.theme_type == settings.selectedTheme);
        this.setTheme(selectedTheme);
    }

    getAvailableThemes(): Theme[] {
        return this.availableThemes;
    }

    getActiveTheme(): Theme {
        return this.active;
    }

    setTheme(theme: Theme){
        this.setActiveTheme(theme);
        this.activeTheme.next(theme.theme_type);
    }

    // isDarkTheme(): boolean {
    //     return this.active.name === dark.name;
    // }

    // setDarkTheme(): void {
    //     this.setActiveTheme(dark);
    //     this.activeTheme.next(ThemeTypeEnum.dark);
    // }

    // setLightTheme(): void {
    //     this.setActiveTheme(light);
    //     this.activeTheme.next(ThemeTypeEnum.light);
    // }

    private setActiveTheme(theme: Theme): void {
        this.active = theme;

        Object.keys(this.active.properties).forEach(property => {
            document.documentElement.style.setProperty(
                property,
                this.active.properties[property]
            );
        });

        // Save
        let settings = this.settingsService.getSettings();
        settings.selectedTheme = theme.theme_type;
        this.settingsService.saveSettings(settings);
    }
}