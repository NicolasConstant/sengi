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
        "--scrollbar-color-2": "#090b10",
        "--scrollbar-color-3": "#0f111a",
        "--scrollbar-color-second-2": "#090b10",
        "--scrollbar-color-second-3": "#0f111a",

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
    
        "--stream-edition-background": "#222736",
        "--stream-column-selector-color": "whitesmoke",

        "--stream-new-notification-1": "#96c0ff83",
        "--stream-new-notification-2": "#ffffff00",
        "--stream-new-notification-3": "#ffffff00",
        
        "--stream-remove-cw-background-hover": "#eeeeee",
        "--stream-remove-cw-color-hover": "black",
        "--stream-remove-cw-color": "white",
    
        "--stream-toot-error": "#ff7171",

        "--stream-navigation-button": "#354060",
        "--stream-navigation-button-hover": "#7a8dc7",
        "--stream-navigation-button-focus": "#f5f5f5",
        "--stream-navigation-button-focus-hover": "#f5f5f5",
        "--stream-navigation-close": "#ffffff",
    
        "--stream-toot-load-buffer-color-hover": "white",
        "--stream-toot-load-buffer-border": "black",
    
        "--stream-toot-status-not-last-child-border": "#06070b",

        "--left-bar-link": "#cbcbcb",
        "--left-bar-link-hover": "#8f93a2",

        "--loading-icon-background": "#fff",

        "--profile-validated-font-color": "#4fde23",
        "--profile-validated-background": "#164109",
        "--profile-full-alias-color": "#c9c9c9",
        "--profile-full-alias-color-hover": "#ffffff",
        "--profile-floating-header-box-shadow": "#00000040",
        "--profile-floating-header-inner-background": "#00000073",
        "--profile-floating-header-name-display-name": "#ffffff",
        "--profile-moved-link": "#ffffff",
        "--profile-moved-link-hover": "#ffbe47",
        "--profile-disabled-filter": "#808080",
        "--profile-header-inner-background": "#00000073",
        "--profile-follow-button": "#ffffff",
        "--profile-follow-button-hover": "#d8d8d8",
        "--profile-followed": "#85ccff",
        "--profile-followed-hover": "#38abff",
        "--profile-header-state-data-background": "#00000099",
        "--profile-name-display-name": "#ffffff",
        "--profile-follows-border": "#0f111a",
        "--profile-follows-link": "#ffffff",
        "--profile-follows-link-background": "#1a1f2e",
        "--profile-follows-link-background-hover": "#131722",
        "--profile-extra-info-background": "#1a1f2e",
        "--profile-extra-info-floating-boxshadow": "#00000073",
        "--profile-extra-info-links": "#ffffff",
        "--profile-fields-border": "#000000",
        "--profile-lock": "#808080",
        "--profile-fields-background": "#0b0d13",
    }
};