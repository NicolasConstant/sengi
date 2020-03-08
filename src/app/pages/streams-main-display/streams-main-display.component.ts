import { Component, OnInit, OnDestroy, QueryList, ViewChildren, ElementRef } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Select } from "@ngxs/store";
import scrollIntoView from "smooth-scroll-into-view-if-needed";

import { StreamElement } from "../../states/streams.state";
import { NavigationService } from "../../services/navigation.service";
import { StreamComponent } from '../../components/stream/stream.component';

@Component({
    selector: "app-streams-main-display",
    templateUrl: "./streams-main-display.component.html",
    styleUrls: ["./streams-main-display.component.scss"]
})
export class StreamsMainDisplayComponent implements OnInit, OnDestroy {

    @ViewChildren(StreamComponent) private streamComponents: QueryList<StreamComponent>;
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
                let element = this.streamsElementRef.toArray()[columnIndex].nativeElement;
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

                const scrolling = <Promise<any>><any>scrollIntoView(element, { behavior: 'smooth', block: 'nearest'});
                scrolling
                    .then(() => {
                        this.streamComponents.toArray()[columnIndex].focus();
                    });
            }, 0);


        }
    }
}