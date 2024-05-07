import { Theme, ThemeTypeEnum } from "../theme-common";

// Color contour:           #bfcad5
// Color header font:       #2d3134
// Bottom Separator color:  #9ca7b3
// header selectod color:   #e9edf1

export const lightTheme: Theme = {
    name: "light",
    theme_type: ThemeTypeEnum.light,
    properties: {
        "--font-color-primary": "#080b1b",
        "--font-color-secondary": "#0f1f36",
        "--font-link-primary": "white", //3e4048
        "--font-link-primary-hover": "#gray",

        "--color-primary": "#e6ebf0",
        "--color-secondary": "#bfcad5",

        "--column-color": "white",
        "--column-header-background-color": "#bfcad5",        
        "--content-warning-background-color": "black",

        "--btn-primary-color": "#444f74",
        "--btn-primary-font-color": "white",
        "--status-primary-color": "#2d3134",
        "--status-secondary-color": "#292c37",
        "--status-links-color": "#457aa2",
        "--boost-color": "#5098eb",
        "--update-color": "#95e470",
        "--favorite-color": "#ffc16f",
        "--bookmarked-color": "#ff5050",

        "--button-color": "#b3b3b3",
        "--button-color-hover": "white",
        "--button-border-color": "#303957",

        "--column-background": "#f6f7f9",

        "--card-border-color": "#b5c2d1",

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
        "--selected-status": "#f2f5f8",        

        "--autosuggest-background": "#ffffff",
        "--autosuggest-entry-background": "#0f111a",
        "--autosuggest-entry-color": "#62667a",
        "--autosuggest-entry-handle-color": "#e2e2e2",
        "--autosuggest-entry-background-hover": "#2e3346",
        "--autosuggest-entry-color-hover": "#e2e2e2",
        "--autosuggest-entry-handle-color-hover": "#ffffff",

        //"--scrollbar-color": "#08090d",
        "--scrollbar-color": "#0f0",
        "--scrollbar-color-2": "#e3eaef",
        "--scrollbar-color-3": "#ffffff00",
        "--scrollbar-color-second-2": "#e3eaef",
        "--scrollbar-color-second-3": "#bfcad5",

        "--poll-editor-background": "#fff",

        "--poll-editor-separator": "#e7e7e7",
        "--poll-editor-input-border": "#b9b9b9",
        "--poll-editor-input-border-focus": "#007be0",

        "--scheduler-background": "#3e455f",

        "--notification-column-selector-background": "#e9edf1",
        "--notification-column-selector-color": "#999fb1",
        "--notification-column-selector-color-hover": "#2d3134",

        "--settings-text-input-background": "#242836",
        "--settings-text-input-foreground": "white",
        "--settings-text-input-border": "#32384d",
        
        "--stream-column-icon": "#2d3134",
        "--stream-column-icon-hover": "#646b72",
        "--stream-column-border": "#9ca7b3",
    
        "--label-bot": "#007281",
        "--label-xpost": "#9c5e00",
        "--label-thread": "#007233",
        "--label-discuss": "#5a008f",
        "--label-old": "#960000",
        "--label-remote": "#264d94",
        "--label-edited": "#5f5f5f",
    
        "--status-content-warning-closed-color": "#919bb1",
        "--status-content-warning-closed-background": "#171d2b",
    
        "--stream-edition-background": "#bfcad5",
        "--stream-column-selector-color": "#2d3134",

        "--stream-new-notification-1": "#96c0ff83",
        "--stream-new-notification-2": "#ffffff00",
        "--stream-new-notification-3": "#ffffff00",
        
        "--stream-remove-cw-background-hover": "#eeeeee",
        "--stream-remove-cw-color-hover": "black",
        "--stream-remove-cw-color": "white",
    
        "--stream-toot-error": "#ff7171",

        "--stream-navigation-button": "#98a6b3",
        "--stream-navigation-button-hover": "#5d6268",
        "--stream-navigation-button-focus": "#2d3134",
        "--stream-navigation-button-focus-hover": "#2d3134",
        "--stream-navigation-close": "#2d3134",
    
        "--stream-toot-load-buffer-color-hover": "white",
        "--stream-toot-load-buffer-border": "black",
    
        "--stream-toot-status-not-last-child-border": "#cedbe7",

        "--left-bar-link": "#2d3134",
        "--left-bar-link-hover": "#8e9092",

        "--loading-icon-background": "#2d3134",

        "--profile-validated-font-color": "#4fde23",
        "--profile-validated-background": "#164109",
        "--profile-full-alias-color": "#c9c9c9",
        "--profile-full-alias-color-hover": "#2d3134",
        "--profile-floating-header-box-shadow": "#00000040",
        "--profile-floating-header-inner-background": "#ffffff73",
        "--profile-floating-header-name-display-name": "#2d3134",
        "--profile-moved-link": "#2d3134",
        "--profile-moved-link-hover": "#ffbe47",
        "--profile-disabled-filter": "#808080",
        "--profile-header-inner-background": "#ffffff73",
        "--profile-follow-button": "#2d3134",
        "--profile-follow-button-hover": "#d8d8d8",
        "--profile-followed": "#85ccff",
        "--profile-followed-hover": "#38abff",
        "--profile-header-state-data-background": "#00000099",
        "--profile-name-display-name": "#2d3134",
        "--profile-follows-border": "#9ca7b3",
        "--profile-follows-link": "#2d3134",
        "--profile-follows-link-background": "#e9edf1",
        "--profile-follows-link-background-hover": "#f6f9fb",
        "--profile-extra-info-background": "#e9edf1",
        "--profile-extra-info-floating-boxshadow": "#ffffff73",
        "--profile-extra-info-links": "#2d3134",
        "--profile-fields-border": "#9ca7b3",
        "--profile-lock": "#808080",
        "--profile-fields-background": "#e9edf1",

        "--floating-column-close-button": "#ffffff",
        "--floating-column-add-account-faq": "#ffcc00",
        "--floating-column-add-account-faq-hover": "#ffe88a",
        "--floating-column-add-account-faq-warning": "#ffdc52",
        "--floating-column-search-result-hashtag": "#ffffff",
        "--floating-column-settings-version": "#a1a1a1",
        "--floating-column-settings-version-hover": "#ffffff",
        "--floating-column-settings-subsection-text": "#8c98ad",
        "--floating-column-settings-subsection-title": "#ffffff",
        "--floating-column-settings-language-warning": "#ffa500",
        "--floating-column-settings-sound-select-background": "#32384d",
        "--floating-column-settings-sound-select-color": "#ffffff",
        "--floating-column-settings-sound-select-border": "#32384d",
        "--floating-column-settings-sound-play-background": "#1f2330",
        "--floating-column-settings-sound-play-color": "#ffffff",
        "--floating-column-settings-sound-play-background-hover": "#32384d",
        "--floating-column-settings-toggle-lock": "#ffffff",
        "--floating-column-settings-toggle-lock-background": "#1f2330",
        "--floating-column-settings-toggle-lock-background-hover": "#32384d",
        "--floating-column-manage-account-header-border": "#222736",
        "--floating-column-manage-account-header-selected": "#f5f5f5",
        "--floating-column-manage-account-header-selected-hover": "#f5f5f5",
        "--floating-column-manage-account-header-notification": "#fa9829",
        "--floating-column-manage-account-header-notification-hover": "#ffb96a",
        "--floating-column-manage-account-dm-icon": "#5098eb",
        "--floating-column-manage-account-dm-stream-border": "#232733",
        "--floating-column-manage-account-myaccount-blue": "#ffffff",
        "--floating-column-manage-account-myaccount-red": "#ffffff",
        "--floating-column-manage-account-myaccount-red-background": "#410303",
        "--floating-column-manage-account-myaccount-red-background-hover": "#4a0303",
        "--floating-column-manage-account-myaccount-list-button-hover": "#ffffff",
        "--floating-column-manage-account-myaccount-list-new": "#ffffff",
        "--floating-column-manage-account-myaccount-advanced-text": "#8c98ad",
        "--floating-column-manage-account-notification-stream-error": "#ff7171",
        "--floating-column-manage-account-notification-border": "#06070b",
        "--floating-column-manage-account-notification-follow-account-display-name": "#f5f5f5",
        "--floating-column-manage-account-notification-follow-request-link": "#b6b6b6",
        "--floating-column-manage-account-notification-follow-request-link-validate": "#adff2f",
        "--floating-column-manage-account-notification-follow-request-link-refuse": "#ff4500",
    }
};