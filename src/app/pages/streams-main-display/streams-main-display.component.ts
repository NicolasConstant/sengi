import { Component, OnInit } from "@angular/core";

import { Stream } from "../../models/stream.models";
import { StreamsService } from "../../services/streams.service";


@Component({
  selector: "app-streams-main-display",
  templateUrl: "./streams-main-display.component.html",
  styleUrls: ["./streams-main-display.component.css"]
})
export class StreamsMainDisplayComponent implements OnInit {
  streams: Stream[] = [];

  constructor(private readonly streamService: StreamsService) {
    

  }

  ngOnInit() {
    this.streamService.streamsSubject.subscribe((streams: Stream[]) => {
      for (let s of streams) {
        this.streams.push(s);
      }
    });

    //for (let i = 0; i < 3; i++) {
    //  this.streams.push(new Stream());
    //}
  }

}
