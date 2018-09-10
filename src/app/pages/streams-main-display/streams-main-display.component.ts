import { Component, OnInit, OnDestroy } from "@angular/core";

import { Stream } from "../../models/stream.models";
import { Observable, Subscription } from "rxjs";
import { ColumnElement } from "../../states/panels.state";
import { Store } from "@ngxs/store";
import { Http } from "@angular/http";


@Component({
  selector: "app-streams-main-display",
  templateUrl: "./streams-main-display.component.html",
  styleUrls: ["./streams-main-display.component.scss"]
})
export class StreamsMainDisplayComponent implements OnInit, OnDestroy {

  streams: Stream[] = [];

  private columns$: Observable<ColumnElement[]>;
  private columnsStateSub: Subscription;
  
  constructor(
    private readonly http: Http,
    private readonly store: Store) {
    this.columns$ = this.store.select(state => state.columnsstatemodel.columns);
  }

  ngOnInit() {

    this.columnsStateSub = this.columns$.subscribe((columns: ColumnElement[]) => {
      this.streams.length = 0;
      for (const column of columns) {
        const newStream = new Stream(this.http, column.name, column.type);
        this.streams.push(newStream);
      }


    });

    // this.streamService.streamsSubject.subscribe((streams: Stream[]) => {
    //   for (let s of streams) {
    //     this.streams.push(s);
    //   }
    // });

    //for (let i = 0; i < 3; i++) {
    //  this.streams.push(new Stream());
    //}
  }

  ngOnDestroy(): void {
    this.columnsStateSub.unsubscribe();
  }

}
