import { Component, OnInit } from "@angular/core";
import { Stream, TootWrapper } from "../../models/stream.models";
import { AccountWrapper } from "../../models/account.models";

@Component({
  selector: "app-stream",
  templateUrl: "./stream.component.html",
  styleUrls: ["./stream.component.css"]
})
export class StreamComponent implements OnInit {
  stream: Stream;
  toots: TootWrapper[] = [];

  constructor() { }

  ngOnInit() {
    //Stubs
    const newStream = new Stream();
    newStream.streamName = "Stream Name";
    this.stream = newStream;

    const acc1 = new AccountWrapper();
    acc1.username = "@mastodon.social@Gargron";
    acc1.avatar = "https://files.mastodon.social/accounts/avatars/000/000/001/original/4df197532c6b768c.png";

    for (let i = 0; i < 20; i++) {
      const newToot = new TootWrapper();
      newToot.account = acc1;
      newToot.content = "Lorem Elsass ipsum tristique semper elit jetz gehts los lacus habitant Hans sagittis baeckeoffe condimentum id, salu bredele ch'ai libero, ftomi! hop Pfourtz ! id munster auctor, Miss Dahlias rhoncus Yo dû. Salu bissame turpis ante amet non sed gal Spätzle Gal !";
      this.toots.push(newToot);
    }
  }

  goToTop(): boolean {
    return false;
  }

}
