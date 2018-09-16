import { Component, OnInit, Input } from "@angular/core";
import { TootWrapper } from "../stream.component";

@Component({
  selector: "app-toot",
  templateUrl: "./toot.component.html",
  styleUrls: ["./toot.component.scss"]
})
export class TootComponent implements OnInit {
  @Input() toot: TootWrapper;

  constructor() { }

  ngOnInit() {
  }

}
