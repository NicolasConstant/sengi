export enum ThemeTypeEnum {
    default = 0,
    light = 1,
    tokyoNight = 2
}

export interface Theme {
    name: string;
    theme_type: ThemeTypeEnum;
    properties: any;
}