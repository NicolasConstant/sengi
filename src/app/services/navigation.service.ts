import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NavigationService {
  openColumnEditorSubject = new BehaviorSubject<string>(null);

  constructor() { }

  openColumnEditor(username: string) {
    this.openColumnEditorSubject.next(username);
  }

  closeColumnEditor() {
    this.openColumnEditorSubject.next(null);
  }
}
