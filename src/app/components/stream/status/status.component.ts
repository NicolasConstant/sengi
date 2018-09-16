import { Component, OnInit, Input } from "@angular/core";
import { Status } from "../../../services/models/mastodon.interfaces";


@Component({
  selector: "app-status",
  templateUrl: "./status.component.html",
  styleUrls: ["./status.component.scss"]
})
export class StatusComponent implements OnInit {
  @Input() status: Status;

  constructor() { }

  ngOnInit() {
  }

}
