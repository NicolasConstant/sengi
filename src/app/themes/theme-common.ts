export enum ThemeTypeEnum {
    default = 0,
    light = 1
}

export interface Theme {
    name: string;
    theme_type: ThemeTypeEnum;
    properties: any;
}