import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountWrapper } from '../models/account.models';

@Injectable()
export class NavigationService {
  openColumnEditorSubject = new BehaviorSubject<AccountWrapper>(null);

  constructor() { }

  openColumnEditor(acc: AccountWrapper) {
    this.openColumnEditorSubject.next(acc);
  }

  closeColumnEditor() {
    this.openColumnEditorSubject.next(null);
  }
}
