import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountWrapper } from '../models/account.models';

@Injectable()
export class NavigationService {

  openColumnEditorSubject = new BehaviorSubject<AccountWrapper>(null);
  columnSelectedSubject = new BehaviorSubject<number>(null);

  constructor() { }

  openColumnEditor(acc: AccountWrapper) {
    this.openColumnEditorSubject.next(acc);
  }

  closeColumnEditor() {
    this.openColumnEditorSubject.next(null);
  }

  columnSelected(index: number): void {
    this.columnSelectedSubject.next(index);    
  }
}
