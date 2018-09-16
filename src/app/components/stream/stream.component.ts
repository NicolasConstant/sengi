import { Component, OnInit, Input } from "@angular/core";
import { Stream, TootWrapper } from "../../models/stream.models";
import { AccountWrapper } from "../../models/account.models";
import { StreamElement } from "../../states/streams.state";
import { StreamingService } from "../../services/streaming.service";
import { HttpClient } from "@angular/common/http";
import { Store } from "@ngxs/store";

@Component({
    selector: "app-stream",
    templateUrl: "./stream.component.html",
    styleUrls: ["./stream.component.scss"]
})
export class StreamComponent implements OnInit {
    stream: Stream;
    private _streamElement: StreamElement;

    @Input()
    set streamElement(streamElement: StreamElement) {
        this._streamElement = streamElement;

        console.log('streamElement');
        console.log(streamElement);
        this.stream = new Stream(this.streamingService, this.httpClient, this.store, streamElement.name, streamElement.type, streamElement.username);
        this.stream.statuses.subscribe((results: TootWrapper[]) => {
            for (let t of results) {
                this.toots.unshift(t);
            }
        });
    }

    get streamElement(): StreamElement {
        return this._streamElement;
    }

    toots: TootWrapper[] = [];

    constructor(
        private readonly store: Store,
        private readonly streamingService: StreamingService,
        private readonly httpClient: HttpClient) {
    }


    ngOnInit() {
    }

    goToTop(): boolean {
        return false;
    }

}
