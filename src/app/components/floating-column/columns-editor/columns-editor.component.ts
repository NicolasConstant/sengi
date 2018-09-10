import { Component, OnInit, Input } from '@angular/core';
import { ColumnElement, ColumnTypeEnum, AddColumn } from '../../../states/panels.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-columns-editor',
  templateUrl: './columns-editor.component.html',
  styleUrls: ['./columns-editor.component.scss']
})
export class ColumnsEditorComponent implements OnInit {
  @Input() username: string;

  availableColumns: ColumnElement[] = [];

  constructor(private readonly store: Store) { }

  ngOnInit() {
    this.availableColumns.length = 0;

    this.availableColumns.push(new ColumnElement(ColumnTypeEnum.global, 'Global Timeline', this.username));
    this.availableColumns.push(new ColumnElement(ColumnTypeEnum.local, 'Local Timeline', this.username));
    this.availableColumns.push(new ColumnElement(ColumnTypeEnum.personnal, 'Personnal Timeline', this.username));
  }

  addColumn(column: ColumnElement): boolean {
    console.warn('addColumn');
    console.warn(column);
    if (column) {
      this.store.dispatch([new AddColumn(column)]);
    }
    return false;
  }
}
