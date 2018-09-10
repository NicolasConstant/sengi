import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-columns-editor',
  templateUrl: './columns-editor.component.html',
  styleUrls: ['./columns-editor.component.scss']
})
export class ColumnsEditorComponent implements OnInit {
  @Input() username: string;

  availableColumns: ColumnElement[] = [];

  constructor() { }

  ngOnInit() {
    this.availableColumns.length = 0;

    this.availableColumns.push(new ColumnElement(ColumnTypeEnum.global, 'Global Timeline', this.username));
    this.availableColumns.push(new ColumnElement(ColumnTypeEnum.local, 'Local Timeline', this.username));
    this.availableColumns.push(new ColumnElement(ColumnTypeEnum.personnal, 'Personnal Timeline', this.username));
  }

  addColumn(column: ColumnElement): boolean {
    console.warn(column);
    return false;
  }

}

export class ColumnElement {
  constructor(public type: ColumnTypeEnum, public name: string, public username: string) {
    
  }
}

export enum ColumnTypeEnum {
  unknown = 0,
  global = 1,
  local = 2,
  personnal = 3,
  favorites = 4,
  activity = 5,
  list = 6,
  directmessages = 7, 
}
