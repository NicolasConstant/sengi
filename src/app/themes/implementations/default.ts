import { Theme, ThemeTypeEnum } from "../theme-common";

export const defaultTheme: Theme = {
    name: "default",
    theme_type: ThemeTypeEnum.default,
    properties: {
        "--font-color-primary": "#e8eaf3",
        "--font-color-secondary": "#bfbfbf",
        "--font-link-primary": "#595c67",
        "--font-link-primary-hover": "#8f93a2",
        "--color-primary": "#141824",
        "--color-secondary": "#090b10",

        "--column-color": "#0f111a",
        "--column-header-background-color": "#0c0c10",        
        "--content-warning-background-color": "black",

        "--btn-primary-color": "#444f74",
        "--btn-primary-font-color": "white",
        "--status-primary-color": "#fff",
        "--status-secondary-color": "#4e5572",
        "--status-links-color": "#d9e1e8",
        "--boost-color": "#5098eb",
        "--update-color": "#95e470",
        "--favorite-color": "#ffc16f",
        "--bookmarked-color": "#ff5050",

        "--button-color": "#b3b3b3",
        "--button-color-hover": "white",
        "--button-border-color": "#303957",

        "--column-background": "#0f111a",

        "--card-border-color": "#2b344d",

        "--context-menu-background": "#ffffff",
        "--context-menu-background-hover": "#d7dfeb",
        "--context-menu-font-color": "#000000",
        "--context-menu-border-color": "#cbd3df",

        "--direct-message-background": "#090a0f",

        "--status-editor-title-background": "#ebebeb",
        "--status-editor-background": "#ffffff",
        "--status-editor-color": "#14151a",
        "--status-editor-footer-background": "#3e455f",
        "--status-editor-footer-link-color": "#e2e2e2",
        "--selected-status": "#1e2734",

        "--autosuggest-background": "#ffffff",
        "--autosuggest-entry-background": "#0f111a",
        "--autosuggest-entry-color": "#62667a",
        "--autosuggest-entry-handle-color": "#e2e2e2",
        "--autosuggest-entry-background-hover": "#2e3346",
        "--autosuggest-entry-color-hover": "#e2e2e2",
        "--autosuggest-entry-handle-color-hover": "#ffffff",

        "--scrollbar-color": "#08090d",

        "--poll-editor-background": "#fff",

        "--poll-editor-separator": "#e7e7e7",
        "--poll-editor-input-border": "#b9b9b9",
        "--poll-editor-input-border-focus": "#007be0",

        "--scheduler-background": "#3e455f",

        "--notification-column-selector-background": "#171c29",
        "--notification-column-selector-color": "#999fb1",
        "--notification-column-selector-color-hover": "white",

        "--settings-text-input-background": "#242836",
        "--settings-text-input-foreground": "white",
        "--settings-text-input-border": "#32384d",
    }
};