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
        "--font-link-primary": "#5f6a76",// "white", //3e4048
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

        "--column-background": "#ffffff", //f6f7f9

        "--card-border-color": "#b5c2d1",

        "--context-menu-background": "#ffffff",
        "--context-menu-background-hover": "#d7dfeb",
        "--context-menu-font-color": "#000000",
        "--context-menu-border-color": "#cbd3df",
        "--context-menu-link-profile-color": "#262731",
        "--context-menu-link-profile-color-hover":"#4f525f",

        "--direct-message-background": "#bfcad5",

        "--status-editor-title-background": "#ebebeb",
        "--status-editor-background": "#ffffff",
        "--status-editor-color": "#14151a",        
        "--status-editor-footer-background": "#97acca", //8ea1bf 3e455f
        "--status-editor-footer-link-color": "#f1f1f1", //e2e2e2
        "--status-editor-lang-color": "#a5a5a5",
        "--status-editor-lang-background": "#ffffff00",
        "--status-editor-lang-color-hover": "#000000",
        "--status-editor-lang-background-hover": "#e6e6e6",
        "--status-editor-mention-error-color": "#ff2222",
        "--status-editor-footer-counter-color": "#ffffff", //e8eaf3
        "--status-editor-footer-send-button-color": "#ffffff", //e8eaf3
        "--selected-status": "#f2f5f8",   
        "--status-content-warning-border": "#c0cad4",
        "--status-content-warning-color": "#080b1b",     

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

        "--poll-color": "#080b1b",
        "--poll-error-color": "#ff0000",
        "--poll-refresh-color": "#6579a0",
        "--poll-color-statistics-color": "#080b1b",
        "--poll-hover-checkmark-background": "#ccc",
        "--poll-checked-checkmark-background": "#3e4b64",
        "--poll-checkmark-box-background": "#eee",
        "--poll-checkmark-round-background": "#eee",
        "--poll-checkmark-round-after-background": "#ffffff",
        "--poll-checkmark-border": "#ffffff",
        "--poll-result-percentage-color": "#080b1b",
        "--poll-result-progress-bar": "#949cab",
        "--poll-result-progress-bar-most-votes": "#80c1db",

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
    
        "--label-bot": "#91d9e3",
        "--label-xpost": "#e9d0ab", //9c5e00
        "--label-thread": "#9bebbf", //007233
        "--label-discuss": "#d5a8ef", //5a008f
        "--label-old": "#f0abab", //960000
        "--label-remote": "#a5beeb", //264d94
        "--label-edited": "#c6c6c6", //5f5f5f
    
        "--status-content-warning-closed-color": "#080b1b",
        "--status-content-warning-closed-background": "#c0cad4",
    
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
        "--left-icon-cog-color": "#ffffff",
        "--left-icon-cog-opacity": ".6",

        "--loading-icon-background": "#2d3134",

        "--profile-validated-font-color": "#4fde23",
        "--profile-validated-background": "#164109",
        "--profile-full-alias-color": "#88909c",
        "--profile-full-alias-color-hover": "#2d3134",
        "--profile-floating-header-box-shadow": "#00000040",
        "--profile-floating-header-inner-background": "#ffffffdd", //ffffff73
        "--profile-floating-header-name-display-name": "#2d3134",
        "--profile-moved-link": "#2d3134",
        "--profile-moved-link-hover": "#ffbe47",
        "--profile-disabled-filter": "#808080",
        "--profile-header-inner-background": "#ffffffbb", //ffffff73
        "--profile-follow-button": "#2d3134",
        "--profile-follow-button-hover": "#d8d8d8",
        "--profile-followed": "#27a2fa", //85ccff
        "--profile-followed-hover": "#005b9d",
        "--profile-header-state-data-background": "#ffffff99",
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

        "--floating-column-close-button": "#080b1b",
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
        //"--floating-column-manage-account-header-border": "#222736",
        "--floating-column-manage-account-header-border": "#9ca7b3",
        "--floating-column-manage-account-header-selected": "black",
        "--floating-column-manage-account-header-selected-hover": "#398be5",
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
        "--floating-column-manage-account-notification-follow-account-display-name": "#080b1b",
        "--floating-column-manage-account-notification-follow-request-link": "#b6b6b6",
        "--floating-column-manage-account-notification-follow-request-link-validate": "#adff2f",
        "--floating-column-manage-account-notification-follow-request-link-refuse": "#ff4500",

        "--stream-selection-representation-background": "#e6ebf0", //595c67
        "--stream-selection-representation-hover-background": "#ffffff", //8f93a2
        "--stream-selection-representation-selected-background": "#ffffff",
        "--stream-selection-representation-selected-hover-background": "#ffffff",

        "--tutorial-bg-primary": "#e6ebf0",
        "--tutorial-bg-secondary": "#6bcbf8", //0075ac
        "--tutorial-bg-tertiary": "#6bcbf8", //00547a
        "--tutorial-bg-quaternary": "#2ab1f0", //004a6d
        "--tutorial-text-primary": "#080b1b",
        "--tutorial-text-secondary": "#5f6a76",
        "--tutorial-text-muted": "#88909c",
        "--tutorial-border": "#bfcad5",
        "--tutorial-button-hover": "#d9e2e8",
        "--tutorial-close": "#88909c",

        "--notification-success-bg": "#22b90e",
        "--notification-success-fg": "#ffffff",
        "--notification-error-bg": "#dc2626",
        "--notification-error-fg": "#ffffff",
        "--notification-text-muted": "rgba(0, 0, 0, 0.5)",

        "--draggable-accent": "#22b90e",
        "--language-warning": "#d97706",
        "--language-warning-link": "#b45309",
        "--language-warning-link-hover": "#92400e",
        "--context-menu-icon": "#4b5563",

        "--card-provider": "#2d3134",
        "--card-image-overlay": "rgba(255, 255, 255, 0.9)",
        "--card-error-bg": "#ffffff",
        "--attachment-outline-warning": "#d97706",
        "--attachment-bg": "#ffffff",
        "--attachment-icon": "#4b5563",
        "--attachment-icon-alt": "#2d3134",
        "--attachment-gradient-start": "rgba(255, 255, 255, 0.5)",
        "--attachment-gradient-end": "rgba(255, 255, 255, 0)",

        "--post-expander-link": "#2563eb",
        "--post-expander-link-hover": "#1e40af", //1d4ed8
        "--post-expander-background": "#ffffff",
        "--post-expander-background-25-opacity": "#ffffff3a",
        "--post-expander-background-50-opacity": "#ffffff83",

        "--code-post-color": "#0284c7",

        "--post-scrollbar-background": "#f1f5f9",
        "--post-scrollbar-thumb-background": "#e2e8f0",

        "--hashtag-border": "#bfcad5",
        "--hashtag-text": "#080b1b",
        
        "--media-viewer-icon": "#2d3134",
        "--media-viewer-overlay": "rgba(255, 255, 255, 0.9)",

        "--account-icon-warning-border": "#d97706",
        "--account-icon-warning": "#d97706",
        "--account-icon-overlay": "rgba(255, 255, 255, 0.7)",
        
        "--list-editor-text-primary": "#080b1b",
        "--list-editor-text-secondary": "#2d3134",
        "--list-editor-text-muted": "#6b7280",
        "--list-editor-border": "#bfcad5",
        "--list-account-text": "#080b1b",
        "--list-account-text-dimmed": "#6b7280",
        "--list-account-text-secondary": "#4b5563",

        "--scheduled-status-muted": "#6b7280",
        "--scheduled-status-delete-bg-1": "#dc2626",
        "--scheduled-status-delete-bg-2": "#b91c1c",
        
        "--scheduler-text": "#080b1b",
        "--scheduler-text-secondary": "#4b5563",

        "--poll-editor-text-primary": "#080b1b",
        "--poll-editor-text-secondary": "#4b5563",
        "--poll-entry-text-muted": "#6b7280",
        "--poll-entry-text-primary": "#080b1b",
        "--poll-entry-border": "#bfcad5",

        "--stream-overlay-border": "#bfcad5",
        "--stream-overlay-text-muted": "#6b7280",
        
        "--app-overlay-bg": "rgba(255, 255, 255, 0.9)",
        "--app-drag-border": "#bfcad5",
        "--app-notification-text": "#080b1b",
        "--app-notification-shadow": "rgba(0, 0, 0, 0.1)",
        "--app-button-primary": "#ffffff",
        "--app-button-primary-bg": "#3b82f6",
        "--app-button-secondary-bg": "#e2e8f0",
        "--app-media-overlay": "rgba(0, 0, 0, 0.6)",
        
        "--streams-shadow": "rgba(0, 0, 0, 0.1)",

        "--button-danger-bg": "#dc2626",
        "--button-danger-bg-hover": "#b91c1c",
        "--button-danger-color": "#ffffff",
        
        "--context-menu-shadow": "rgba(0, 0, 0, 0.1)",
        
        "--media-overlay-bg": "rgba(0, 0, 0, 0.3)",
        "--media-overlay-bg-hover": "rgba(0, 0, 0, 0.5)",
        "--media-icon": "#ffffff",

        "--attachment-icon-overlay": "#2d3134",
        "--attachment-icon-shadow": "#9ca3af",
        "--attachment-icon-shadow-hover": "#6b7280"
    }
};