import { T } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ILanguage } from '../states/settings.state';
import { MyElectronService } from './electron.service';
import { SettingsService } from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    configuredLanguagesChanged = new BehaviorSubject<ILanguage[]>([]);
    selectedLanguageChanged = new BehaviorSubject<ILanguage>(null);

    constructor(
        private settingsService: SettingsService,
        private electronService: MyElectronService
    ) {
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

        if (lang) {
            this.electronService.setLang(lang.iso639);
        }
    }

    getConfiguredLanguages(): ILanguage[] {
        const langs = this.settingsService.getSettings().configuredLanguages;
        return langs;
    }

    addLanguage(lang: ILanguage) {
        var settings = this.settingsService.getSettings();
        settings.configuredLanguages.push(lang);
        settings.configuredLanguages.sort((a, b) => a.name.localeCompare(b.name));
        this.settingsService.saveSettings(settings);

        this.configuredLanguagesChanged.next(settings.configuredLanguages);

        if (settings.configuredLanguages.length === 1) {
            this.setSelectedLanguage(lang);
        }
    }

    removeLanguage(lang: ILanguage) {
        var settings = this.settingsService.getSettings();
        settings.configuredLanguages = settings.configuredLanguages.filter(x => x.iso639 !== lang.iso639);
        this.settingsService.saveSettings(settings);

        this.configuredLanguagesChanged.next(settings.configuredLanguages);

        if (this.getSelectedLanguage().iso639 === lang.iso639) {
            if (settings.configuredLanguages.length > 0) {
                this.setSelectedLanguage(settings.configuredLanguages[0]);
            } else {
                this.setSelectedLanguage(null);
            }
        }
    }

    searchLanguage(input: string): ILanguage[] {
        if (!input) return [];

        const avLangs = this.getAllAvaialbleLaguages();
        let found = avLangs.filter(x => x.name.toLowerCase().includes(input.toLowerCase()) || x.iso639.toLowerCase().includes(input.toLowerCase()));
        found.sort((a, b) => a.name.localeCompare(b.name));
        found = found.slice(0, 5);
        return found;
    }

    private getAllAvaialbleLaguages(): Language[] {
        return [
            new Language("aa", "Afar"),
            new Language("ab", "Abkhazian"),
            new Language("af", "Afrikaans"),
            new Language("ak", "Akan"),
            new Language("am", "Amharic"),
            new Language("an", "Aragonese"),
            new Language("ar", "Arabic"),
            new Language("as", "Assamese"),
            new Language("av", "Avar"),
            new Language("ay", "Aymara"),
            new Language("az", "Azerbaijani"),
            new Language("ba", "Bashkir"),
            new Language("be", "Belarusian"),
            new Language("bg", "Bulgarian"),
            new Language("bh", "Bihari"),
            new Language("bi", "Bislama"),
            new Language("bm", "Bambara"),
            new Language("bn", "Bengali"),
            new Language("bo", "Tibetan"),
            new Language("br", "Breton"),
            new Language("bs", "Bosnian"),
            new Language("ca", "Catalan"),
            new Language("ce", "Chechen"),
            new Language("ch", "Chamorro"),
            new Language("co", "Corsican"),
            new Language("cr", "Cree"),
            new Language("cs", "Czech"),
            new Language("cu", "Old Church Slavonic"),
            new Language("cv", "Chuvash"),
            new Language("cy", "Welsh"),
            new Language("da", "Danish"),
            new Language("de", "German"),
            new Language("dv", "Divehi"),
            new Language("dz", "Dzongkha"),
            new Language("ee", "Ewe"),
            new Language("el", "Greek"),
            new Language("en", "English"),
            new Language("eo", "Esperanto"),
            new Language("es", "Spanish"),
            new Language("et", "Estonian"),
            new Language("eu", "Basque"),
            new Language("fa", "Persian"),
            new Language("ff", "Peul"),
            new Language("fi", "Finnish"),
            new Language("fj", "Fijian"),
            new Language("fo", "Faroese"),
            new Language("fr", "French"),
            new Language("fy", "West Frisian"),
            new Language("ga", "Irish"),
            new Language("gd", "Scottish Gaelic"),
            new Language("gl", "Galician"),
            new Language("gn", "Guarani"),
            new Language("gu", "Gujarati"),
            new Language("gv", "Manx"),
            new Language("ha", "Hausa"),
            new Language("he", "Hebrew"),
            new Language("hi", "Hindi"),
            new Language("ho", "Hiri Motu"),
            new Language("hr", "Croatian"),
            new Language("ht", "Haitian"),
            new Language("hu", "Hungarian"),
            new Language("hy", "Armenian"),
            new Language("hz", "Herero"),
            new Language("ia", "Interlingua"),
            new Language("id", "Indonesian"),
            new Language("ie", "Interlingue"),
            new Language("ig", "Igbo"),
            new Language("ii", "Sichuan Yi"),
            new Language("ik", "Inupiak"),
            new Language("io", "Ido"),
            new Language("is", "Icelandic"),
            new Language("it", "Italian"),
            new Language("iu", "Inuktitut"),
            new Language("ja", "Japanese"),
            new Language("jv", "Javanese"),
            new Language("ka", "Georgian"),
            new Language("kg", "Kongo"),
            new Language("ki", "Kikuyu"),
            new Language("kj", "Kuanyama"),
            new Language("kk", "Kazakh"),
            new Language("kl", "Greenlandic"),
            new Language("km", "Cambodian"),
            new Language("kn", "Kannada"),
            new Language("ko", "Korean"),
            new Language("kr", "Kanuri"),
            new Language("ks", "Kashmiri"),
            new Language("ku", "Kurdish"),
            new Language("kv", "Komi"),
            new Language("kw", "Cornish"),
            new Language("ky", "Kirghiz"),
            new Language("la", "Latin"),
            new Language("lb", "Luxembourgish"),
            new Language("lg", "Ganda"),
            new Language("li", "Limburgian"),
            new Language("ln", "Lingala"),
            new Language("lo", "Laotian"),
            new Language("lt", "Lithuanian"),
            new Language("lu", "Luba-Katanga"),
            new Language("lv", "Latvian"),
            new Language("mg", "Malagasy"),
            new Language("mh", "Marshallese"),
            new Language("mi", "Maori"),
            new Language("mk", "Macedonian"),
            new Language("ml", "Malayalam"),
            new Language("mn", "Mongolian"),
            new Language("mo", "Moldovan"),
            new Language("mr", "Marathi"),
            new Language("ms", "Malay"),
            new Language("mt", "Maltese"),
            new Language("my", "Burmese"),
            new Language("na", "Nauruan"),
            new Language("nb", "Norwegian Bokmål"),
            new Language("nd", "North Ndebele"),
            new Language("ne", "Nepali"),
            new Language("ng", "Ndonga"),
            new Language("nl", "Dutch"),
            new Language("nn", "Norwegian Nynorsk"),
            new Language("no", "Norwegian"),
            new Language("nr", "South Ndebele"),
            new Language("nv", "Navajo"),
            new Language("ny", "Chichewa"),
            new Language("oc", "Occitan"),
            new Language("oj", "Ojibwa"),
            new Language("om", "Oromo"),
            new Language("or", "Oriya"),
            new Language("os", "Ossetian"),
            new Language("pa", "Panjabi"),
            new Language("pi", "Pali"),
            new Language("pl", "Polish"),
            new Language("ps", "Pashto"),
            new Language("pt", "Portuguese"),
            new Language("qu", "Quechua"),
            new Language("rm", "Raeto Romance"),
            new Language("rn", "Kirundi"),
            new Language("ro", "Romanian"),
            new Language("ru", "Russian"),
            new Language("rw", "Rwandi"),
            new Language("sa", "Sanskrit"),
            new Language("sc", "Sardinian"),
            new Language("sd", "Sindhi"),
            new Language("se", "Northern Sami"),
            new Language("sg", "Sango"),
            new Language("sh", "Serbo-Croatian"),
            new Language("si", "Sinhalese"),
            new Language("sk", "Slovak"),
            new Language("sl", "Slovenian"),
            new Language("sm", "Samoan"),
            new Language("sn", "Shona"),
            new Language("so", "Somalia"),
            new Language("sq", "Albanian"),
            new Language("sr", "Serbian"),
            new Language("ss", "Swati"),
            new Language("st", "Southern Sotho"),
            new Language("su", "Sundanese"),
            new Language("sv", "Swedish"),
            new Language("sw", "Swahili"),
            new Language("ta", "Tamil"),
            new Language("te", "Telugu"),
            new Language("tg", "Tajik"),
            new Language("th", "Thai"),
            new Language("ti", "Tigrinya"),
            new Language("tk", "Turkmen"),
            new Language("tl", "Tagalog"),
            new Language("tn", "Tswana"),
            new Language("to", "Tonga"),
            new Language("tr", "Turkish"),
            new Language("ts", "Tsonga"),
            new Language("tt", "Tatar"),
            new Language("tw", "Twi"),
            new Language("ty", "Tahitian"),
            new Language("ug", "Uyghur"),
            new Language("uk", "Ukrainian"),
            new Language("ur", "Urdu"),
            new Language("uz", "Uzbek"),
            new Language("ve", "Venda"),
            new Language("vi", "Vietnamese"),
            new Language("vo", "Volapük"),
            new Language("wa", "Walloon"),
            new Language("wo", "Wolof"),
            new Language("xh", "Xhosa"),
            new Language("yi", "Yiddish"),
            new Language("yo", "Yoruba"),
            new Language("za", "Zhuang"),
            new Language("zh", "Chinese"),
            new Language("zu", "Zulu"),
        ];
    }
}

export class Language {
    constructor(public iso639: string, public name: string) {
    }
}
