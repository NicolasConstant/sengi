import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { HttpClientModule } from '@angular/common/http';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { NgxElectronModule } from "ngx-electron";

import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from "./app.component";
import { LeftSideBarComponent } from "./components/left-side-bar/left-side-bar.component";
import { StreamsMainDisplayComponent } from "./pages/streams-main-display/streams-main-display.component";
import { StreamComponent } from "./components/stream/stream.component";
import { StreamsSelectionFooterComponent } from "./components/streams-selection-footer/streams-selection-footer.component";
import { RegisterNewAccountComponent } from "./pages/register-new-account/register-new-account.component";
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
import { AttachementsComponent } from './components/stream/status/attachements/attachements.component';
import { SettingsComponent } from './components/floating-column/settings/settings.component';
import { AddNewAccountComponent } from './components/floating-column/add-new-account/add-new-account.component';
import { SearchComponent } from './components/floating-column/search/search.component';
import { AddNewStatusComponent } from "./components/floating-column/add-new-status/add-new-status.component";
import { ManageAccountComponent } from "./components/floating-column/manage-account/manage-account.component";
import { ActionBarComponent } from './components/stream/status/action-bar/action-bar.component';
import { WaitingAnimationComponent } from './components/waiting-animation/waiting-animation.component';
import { ReplyToStatusComponent } from './components/stream/status/reply-to-status/reply-to-status.component';
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

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: StreamsMainDisplayComponent },
  { path: "register", component: RegisterNewAccountComponent}, 
  { path: "**", redirectTo: "home" }
];

@NgModule({
  declarations: [
    AppComponent,
    LeftSideBarComponent,
    StreamsMainDisplayComponent,
    StreamComponent,
    StreamsSelectionFooterComponent,
    StatusComponent,
    RegisterNewAccountComponent,
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
    ReplyToStatusComponent,
    UserProfileComponent,
    ThreadComponent,
    HashtagComponent,
    StreamOverlayComponent,
    DatabindedTextComponent,
    TimeAgoPipe,
    StreamStatusesComponent,
    StreamEditionComponent,
    TutorialComponent,
    NotificationHubComponent
  ],
  imports: [
    FontAwesomeModule,
    BrowserModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    NgxElectronModule,
    RouterModule.forRoot(routes),

    NgxsModule.forRoot([
      RegisteredAppsState,
      AccountsState,
      StreamsState
    ]),
    NgxsStoragePluginModule.forRoot()
  ],
  providers: [AuthService, NavigationService, NotificationService, MastodonService, StreamingService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
