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
        "--foreground-default": "white",
    }
};

export const lightTheme: Theme = {
    name: "light",
    type: ThemeTypeEnum.light,
    properties: {
        "--foreground-default": "black",
    }
};
