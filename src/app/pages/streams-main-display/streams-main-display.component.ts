import { Component, OnInit, OnDestroy } from "@angular/core";

import { Stream } from "../../models/stream.models";
import { Observable, Subscription } from "rxjs";
import { StreamElement } from "../../states/streams.state";
import { Store } from "@ngxs/store";
import { Http } from "@angular/http";


@Component({
  selector: "app-streams-main-display",
  templateUrl: "./streams-main-display.component.html",
  styleUrls: ["./streams-main-display.component.scss"]
})
export class StreamsMainDisplayComponent implements OnInit, OnDestroy {

  streams: Stream[] = [];

  private streams$: Observable<StreamElement[]>;
  private streamsStateSub: Subscription;
  
  constructor(
    private readonly http: Http,
    private readonly store: Store) {
    this.streams$ = this.store.select(state => state.streamsstatemodel.streams);
  }

  ngOnInit() {

    this.streamsStateSub = this.streams$.subscribe((streams: StreamElement[]) => {
      this.streams.length = 0;
      for (const stream of streams) {
        const newStream = new Stream(this.http, stream.name, stream.type);
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
    this.streamsStateSub.unsubscribe();
  }

}
