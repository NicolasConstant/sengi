import { Theme, ThemeTypeEnum } from "../theme-common";

export const lightTheme: Theme = {
    name: "light",
    theme_type: ThemeTypeEnum.light,
    properties: {
        "--font-color-primary": "#e8eaf3",
        "--font-color-secondary": "#bfbfbf",
        "--font-link-primary": "#595c67",
        "--font-link-primary-hover": "#8f93a2",

        "--color-primary": "#ffffff",
        "--color-secondary": "#e6ebf0",

        "--column-color": "#0f111a",
        "--column-header-background-color": "#0c0c10",        
        "--content-warning-background-color": "black",

        "--btn-primary-color": "#444f74",
        "--btn-primary-font-color": "white",
        "--status-primary-color": "#fff",
        "--status-secondary-color": "#292c37",
        "--status-links-color": "#d9e1e8",
        "--boost-color": "#5098eb",
        "--update-color": "#95e470",
        "--favorite-color": "#ffc16f",
        "--bookmarked-color": "#ff5050",

        "--button-color": "#b3b3b3",
        "--button-color-hover": "white",
        "--button-border-color": "#303957",

        "--column-background": "#f6f7f9",

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
        
        "--stream-column-icon": "whitesmoke",
        "--stream-column-icon-hover": "#acacac",
        "--stream-column-border": "#222736",
    
        "--label-bot": "#007281",
        "--label-xpost": "#9c5e00",
        "--label-thread": "#007233",
        "--label-discuss": "#5a008f",
        "--label-old": "#960000",
        "--label-remote": "#264d94",
        "--label-edited": "#5f5f5f",
    
        "--status-content-warning-closed-color": "#919bb1",
        "--status-content-warning-closed-background": "#171d2b",
    
        "--stream-new-notification-1": "#96c0ff83",
        "--stream-new-notification-2": "#ffffff00",
        "--stream-new-notification-3": "#ffffff00",
        
        "--stream-remove-cw-background-hover": "#eeeeee",
        "--stream-remove-cw-color-hover": "black",
        "--stream-remove-cw-color": "white",
    
        "--stream-toot-error": "#ff7171",
    
        "--stream-toot-load-buffer-color-hover": "white",
        "--stream-toot-load-buffer-border": "black",
    
        "--stream-toot-status-not-last-child-border": "#06070b",
    }
};