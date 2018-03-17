import { Component, OnInit } from '@angular/core';
import { Stream } from 'stream';

@Component({
  selector: 'app-streams-main-display',
  templateUrl: './streams-main-display.component.html',
  styleUrls: ['./streams-main-display.component.css']
})
export class StreamsMainDisplayComponent implements OnInit {
  streams: Stream[] = [];

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < 3; i++) {
      this.streams.push(new Stream());
    }
  }

}
