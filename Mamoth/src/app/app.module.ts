import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgxElectronModule } from 'ngx-electron';

import { AppComponent } from './app.component';
import { LeftSideBarComponent } from './components/left-side-bar/left-side-bar.component';
import { StreamsMainDisplayComponent } from './components/streams-main-display/streams-main-display.component';
import { StreamComponent } from './components/stream/stream.component';
import { StreamsSelectionFooterComponent } from './components/streams-selection-footer/streams-selection-footer.component';


@NgModule({
  declarations: [
    AppComponent,
    LeftSideBarComponent,
    StreamsMainDisplayComponent,
    StreamComponent,
    StreamsSelectionFooterComponent
  ],
  imports: [
    BrowserModule, 
    NgxElectronModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
