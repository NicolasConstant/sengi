import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-floating-column',
  templateUrl: './floating-column.component.html',
  styleUrls: ['./floating-column.component.scss']
})
export class FloatingColumnComponent implements OnInit {
  userAccountUsed: string;
  columnEditorIsOpen: boolean;
  messageEditorIsOpen: boolean;

  constructor(private readonly navigationService: NavigationService) { }

  ngOnInit() {
    this.navigationService.openColumnEditorSubject.subscribe((username: string) => {
      this.userAccountUsed = username;
      if(username) {
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
