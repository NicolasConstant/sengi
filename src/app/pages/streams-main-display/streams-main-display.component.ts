import { Component, OnInit, OnDestroy, QueryList, ViewChildren, ElementRef } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Select } from "@ngxs/store";

import { StreamElement } from "../../states/streams.state";
import { NavigationService } from "../../services/navigation.service";

@Component({
    selector: "app-streams-main-display",
    templateUrl: "./streams-main-display.component.html",
    styleUrls: ["./streams-main-display.component.scss"]
})
export class StreamsMainDisplayComponent implements OnInit, OnDestroy {

    @Select(state => state.streamsstatemodel.streams) streamElements$: Observable<StreamElement[]>;
    private columnSelectedSub: Subscription;

    constructor(
        private readonly navigationService: NavigationService) {
    }

    ngOnInit() {
        this.columnSelectedSub = this.navigationService.columnSelectedSubject.subscribe((columnIndex: number) => {
            this.focusOnColumn(columnIndex);
        });
    }

    ngOnDestroy(): void {
        this.columnSelectedSub.unsubscribe();
    }

    @ViewChildren('stream', { read: ElementRef }) public streamsElementRef: QueryList<ElementRef>;;
    private focusOnColumn(columnIndex: number): void {
        if (columnIndex > -1) {
            setTimeout(() => {
                this.streamsElementRef.toArray()[columnIndex].nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            });
        }
    }
}
