import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { NavigationService } from './services/navigation.service';
import { Subscription } from 'rxjs';
import { AccountWrapper } from './models/account.models';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
 
  title = 'app';

  private floatingColumnActive: boolean;
  private columnEditorSub: Subscription;

  constructor(private readonly navigationService: NavigationService) {
   
  }
  
  ngOnInit(): void {
    this.columnEditorSub = this.navigationService.openColumnEditorSubject.subscribe((acc: AccountWrapper) => {
      if(acc) {
        this.floatingColumnActive = true;
      } else {
        this.floatingColumnActive = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.columnEditorSub.unsubscribe();
  }
  
}
