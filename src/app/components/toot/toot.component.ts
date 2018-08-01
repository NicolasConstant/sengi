import { Component, OnInit, Input } from "@angular/core";
import { TootWrapper } from "../../models/stream.models";

@Component({
  selector: "app-toot",
  templateUrl: "./toot.component.html",
  styleUrls: ["./toot.component.css"]
})
export class TootComponent implements OnInit {
  @Input() toot: TootWrapper;

  constructor() { }

  ngOnInit() {
  }

}
