import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { NgxElectronModule } from "ngx-electron";

import { AppComponent } from "./app.component";
import { LeftSideBarComponent } from "./components/left-side-bar/left-side-bar.component";
import { StreamsMainDisplayComponent } from "./pages/streams-main-display/streams-main-display.component";
import { StreamComponent } from "./components/stream/stream.component";
import { StreamsSelectionFooterComponent } from "./components/streams-selection-footer/streams-selection-footer.component";
import { TootComponent } from "./components/toot/toot.component";
import { RegisterNewAccountComponent } from "./pages/register-new-account/register-new-account.component";
import { AuthService } from "./services/auth.service";

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
    TootComponent,
    RegisterNewAccountComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    NgxElectronModule,
    RouterModule.forRoot(routes)
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
