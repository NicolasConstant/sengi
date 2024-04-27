import { Theme, ThemeTypeEnum } from "../theme-common";

export const lightTheme: Theme = {
    name: "light",
    theme_type: ThemeTypeEnum.light,
    properties: {
        "--font-color-primary": "#000",
        "--font-color-secondary-value": "#000",
        "--font-link-primary": "#000",
        "--font-link-primary-hover": "#000",
        "--color-primary": "#fff",
        "--color-secondary": "#fff",
    }
};