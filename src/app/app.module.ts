import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { HttpClientModule } from '@angular/common/http';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

// import { NgxElectronModule } from "ngx-electron";

import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { OverlayModule } from '@angular/cdk/overlay';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ContextMenuModule } from 'ngx-contextmenu';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { HotkeyModule } from 'angular2-hotkeys';

import { AppComponent } from "./app.component";
import { LeftSideBarComponent } from "./components/left-side-bar/left-side-bar.component";
import { StreamsMainDisplayComponent } from "./pages/streams-main-display/streams-main-display.component";
import { StreamComponent } from "./components/stream/stream.component";
import { StreamsSelectionFooterComponent } from "./components/streams-selection-footer/streams-selection-footer.component";
// import { RegisterNewAccountComponent } from "./pages/register-new-account/register-new-account.component";
import { AuthService } from "./services/auth.service";
import { StreamingService } from "./services/streaming.service";
import { RegisteredAppsState } from "./states/registered-apps.state";
import { AccountsState } from "./states/accounts.state";
import { AccountIconComponent } from './components/left-side-bar/account-icon/account-icon.component';
import { NavigationService } from "./services/navigation.service";
import { FloatingColumnComponent } from './components/floating-column/floating-column.component';
import { StreamsState } from "./states/streams.state";
import { StatusComponent } from "./components/stream/status/status.component";
import { MastodonService } from "./services/mastodon.service";
import { MastodonWrapperService } from "./services/mastodon-wrapper.service";
import { AttachementsComponent } from './components/stream/status/attachments/attachments.component';
import { SettingsComponent } from './components/floating-column/settings/settings.component';
import { AddNewAccountComponent } from './components/floating-column/add-new-account/add-new-account.component';
import { SearchComponent } from './components/floating-column/search/search.component';
import { AddNewStatusComponent } from "./components/floating-column/add-new-status/add-new-status.component";
import { ManageAccountComponent } from "./components/floating-column/manage-account/manage-account.component";
import { ActionBarComponent } from './components/stream/status/action-bar/action-bar.component';
import { WaitingAnimationComponent } from './components/waiting-animation/waiting-animation.component';
import { UserProfileComponent } from './components/stream/user-profile/user-profile.component';
import { ThreadComponent } from './components/stream/thread/thread.component';
import { HashtagComponent } from './components/stream/hashtag/hashtag.component';
import { StreamOverlayComponent } from './components/stream/stream-overlay/stream-overlay.component';
import { DatabindedTextComponent } from './components/stream/status/databinded-text/databinded-text.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { StreamStatusesComponent } from './components/stream/stream-statuses/stream-statuses.component';
import { StreamEditionComponent } from './components/stream/stream-edition/stream-edition.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { NotificationHubComponent } from './components/notification-hub/notification-hub.component';
import { NotificationService } from "./services/notification.service";
import { MediaViewerComponent } from './components/media-viewer/media-viewer.component';
import { CreateStatusComponent } from './components/create-status/create-status.component';
import { MediaComponent } from './components/create-status/media/media.component';
import { MyAccountComponent } from './components/floating-column/manage-account/my-account/my-account.component';
import { FavoritesComponent } from './components/floating-column/manage-account/favorites/favorites.component';
import { DirectMessagesComponent } from './components/floating-column/manage-account/direct-messages/direct-messages.component';
import { MentionsComponent } from './components/floating-column/manage-account/mentions/mentions.component';
import { NotificationsComponent } from './components/floating-column/manage-account/notifications/notifications.component';
import { SettingsState } from './states/settings.state';
import { AccountEmojiPipe } from './pipes/account-emoji.pipe';
import { CardComponent } from './components/stream/status/card/card.component';
import { ListEditorComponent } from './components/floating-column/manage-account/my-account/list-editor/list-editor.component';
import { ListAccountComponent } from './components/floating-column/manage-account/my-account/list-editor/list-account/list-account.component';
import { PollComponent } from './components/stream/status/poll/poll.component';
import { TimeLeftPipe } from './pipes/time-left.pipe';
import { AutosuggestComponent } from './components/create-status/autosuggest/autosuggest.component';
import { EmojiPickerComponent } from './components/create-status/emoji-picker/emoji-picker.component';
import { StatusUserContextMenuComponent } from './components/stream/status/action-bar/status-user-context-menu/status-user-context-menu.component';
import { StatusSchedulerComponent } from './components/create-status/status-scheduler/status-scheduler.component';
import { PollEditorComponent } from './components/create-status/poll-editor/poll-editor.component';
import { PollEntryComponent } from './components/create-status/poll-editor/poll-entry/poll-entry.component';
import { ScheduledStatusesComponent } from './components/floating-column/scheduled-statuses/scheduled-statuses.component';
import { ScheduledStatusComponent } from './components/floating-column/scheduled-statuses/scheduled-status/scheduled-status.component';
import { StreamNotificationsComponent } from './components/stream/stream-notifications/stream-notifications.component';
import { NotificationComponent } from './components/floating-column/manage-account/notifications/notification/notification.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BookmarksComponent } from './components/floating-column/manage-account/bookmarks/bookmarks.component';
import { AttachementImageComponent } from './components/stream/status/attachments/attachment-image/attachment-image.component';
import { EnsureHttpsPipe } from './pipes/ensure-https.pipe';
import { UserFollowsComponent } from './components/stream/user-follows/user-follows.component';
import { AccountComponent } from './components/common/account/account.component';
import { TutorialEnhancedComponent } from './components/tutorial-enhanced/tutorial-enhanced.component';
import { NotificationsTutorialComponent } from './components/tutorial-enhanced/notifications-tutorial/notifications-tutorial.component';
import { LabelsTutorialComponent } from './components/tutorial-enhanced/labels-tutorial/labels-tutorial.component';
import { ThankyouTutorialComponent } from './components/tutorial-enhanced/thankyou-tutorial/thankyou-tutorial.component';

const routes: Routes = [
    { path: "", component: StreamsMainDisplayComponent },
    // { path: "home", component: StreamsMainDisplayComponent },
    // { path: "register", component: RegisterNewAccountComponent },
    { path: "**", redirectTo: "" }
];

@NgModule({
    declarations: [
        AppComponent,
        LeftSideBarComponent,
        StreamsMainDisplayComponent,
        StreamComponent,
        StreamsSelectionFooterComponent,
        StatusComponent,
        // RegisterNewAccountComponent,
        AccountIconComponent,
        FloatingColumnComponent,
        ManageAccountComponent,
        AddNewStatusComponent,
        AttachementsComponent,
        SettingsComponent,
        AddNewAccountComponent,
        SearchComponent,
        ActionBarComponent,
        WaitingAnimationComponent,
        UserProfileComponent,
        ThreadComponent,
        HashtagComponent,
        StreamOverlayComponent,
        DatabindedTextComponent,
        TimeAgoPipe,
        StreamStatusesComponent,
        StreamEditionComponent,
        TutorialComponent,
        NotificationHubComponent,
        MediaViewerComponent,
        CreateStatusComponent,
        MediaComponent,
        MyAccountComponent,
        FavoritesComponent,
        DirectMessagesComponent,
        MentionsComponent,
        NotificationsComponent,
        AccountEmojiPipe,
        CardComponent,
        ListEditorComponent,
        ListAccountComponent,
        PollComponent,
        TimeLeftPipe,
        AutosuggestComponent,
        EmojiPickerComponent,
        StatusUserContextMenuComponent,
        StatusSchedulerComponent,
        PollEditorComponent,
        PollEntryComponent,
        ScheduledStatusesComponent,
        ScheduledStatusComponent,
        StreamNotificationsComponent,
        NotificationComponent,
        BookmarksComponent,
        AttachementImageComponent,
        EnsureHttpsPipe,
        UserFollowsComponent,
        AccountComponent,
        TutorialEnhancedComponent,
        NotificationsTutorialComponent,
        LabelsTutorialComponent,
        ThankyouTutorialComponent
    ],
    entryComponents: [
        EmojiPickerComponent
    ],
    imports: [
        FontAwesomeModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        PickerModule,
        OwlDateTimeModule, 
        OwlNativeDateTimeModule,
        OverlayModule,
        RouterModule.forRoot(routes),

        NgxsModule.forRoot([
            RegisteredAppsState,
            AccountsState,
            StreamsState,
            SettingsState
        ]),
        //], { developmentMode: !environment.production }),
        NgxsStoragePluginModule.forRoot(),
        ContextMenuModule.forRoot(),
        HotkeyModule.forRoot(),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [AuthService, NavigationService, NotificationService, MastodonWrapperService, MastodonService, StreamingService],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
