import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Theme, lightTheme, defaultTheme, ThemeTypeEnum } from "./theme";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private active: Theme = defaultTheme;
    private availableThemes: Theme[] = [defaultTheme, lightTheme];

    activeTheme = new BehaviorSubject<ThemeTypeEnum>(ThemeTypeEnum.default);

    constructor() {
        this.setTheme(this.active);
    }

    getAvailableThemes(): Theme[] {
        return this.availableThemes;
    }

    getActiveTheme(): Theme {
        return this.active;
    }

    setTheme(theme: Theme){
        this.setActiveTheme(theme);
        this.activeTheme.next(theme.type);
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
    }
}