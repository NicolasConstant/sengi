export enum ThemeTypeEnum {
    default = 0,
    light = 1
}

export interface Theme {
    name: string;
    type: ThemeTypeEnum;
    properties: any;
}

export const defaultTheme: Theme = {
    name: "default",
    type: ThemeTypeEnum.default,
    properties: {
        "--font-color-primary": "#e8eaf3",
        "--font-color-secondary-value": "#fff",
        "--font-link-primary": "#595c67",
        "--font-link-primary-hover": "#8f93a2",
        "--color-primary": "#141824",
        "--color-secondary": "#090b10",
    }
};

export const lightTheme: Theme = {
    name: "light",
    type: ThemeTypeEnum.light,
    properties: {
        "--font-color-primary": "#000",
        "--font-color-secondary-value": "#000",
        "--font-link-primary": "#000",
        "--font-link-primary-hover": "#000",
        "--color-primary": "#fff",
        "--color-secondary": "#fff",
    }
};
