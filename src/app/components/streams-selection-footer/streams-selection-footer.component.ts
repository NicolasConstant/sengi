import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnElement } from '../../states/panels.state';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-streams-selection-footer',
  templateUrl: './streams-selection-footer.component.html',
  styleUrls: ['./streams-selection-footer.component.scss']
})
export class StreamsSelectionFooterComponent implements OnInit {
  columns: ColumnElement[];
  private columns$: Observable<ColumnElement[]>;

  constructor(private readonly store: Store) { 
    this.columns$ = this.store.select(state => state.columnsstatemodel.columns);
  }

  ngOnInit() {
    this.columns$.subscribe((columns: ColumnElement[]) => {
      this.columns = columns;
    });
  }

}
