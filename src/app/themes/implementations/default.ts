import { Theme, ThemeTypeEnum } from "../theme-common";

export const defaultTheme: Theme = {
    name: "default",
    theme_type: ThemeTypeEnum.default,
    properties: {
        "--font-color-primary": "#e8eaf3",
        "--font-color-secondary-value": "#fff",
        "--font-link-primary": "#595c67",
        "--font-link-primary-hover": "#8f93a2",
        "--color-primary": "#141824",
        "--color-secondary": "#090b10",
    }
};