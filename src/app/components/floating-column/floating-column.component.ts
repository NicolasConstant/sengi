import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { AccountWrapper } from '../../models/account.models';

@Component({
  selector: 'app-floating-column',
  templateUrl: './floating-column.component.html',
  styleUrls: ['./floating-column.component.scss']
})
export class FloatingColumnComponent implements OnInit {
  userAccountUsed: AccountWrapper;
  columnEditorIsOpen: boolean;
  messageEditorIsOpen: boolean;

  constructor(private readonly navigationService: NavigationService) { }

  ngOnInit() {
    this.navigationService.openColumnEditorSubject.subscribe((acc: AccountWrapper) => {
      this.userAccountUsed = acc;
      if(this.userAccountUsed) {
        this.columnEditorIsOpen = true;        
      } else {
        this.columnEditorIsOpen = false;
      }
      
    });
  }

  closePanel(): boolean {
    this.navigationService.closeColumnEditor();
    return false;
  }

}
