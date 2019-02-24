import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StreamElement, StreamTypeEnum } from '../../states/streams.state';
import { Store } from '@ngxs/store';
import { NavigationService } from '../../services/navigation.service';

@Component({
    selector: 'app-streams-selection-footer',
    templateUrl: './streams-selection-footer.component.html',
    styleUrls: ['./streams-selection-footer.component.scss']
})
export class StreamsSelectionFooterComponent implements OnInit {
    streams: StreamElement[] = [];
    private streams$: Observable<StreamElement[]>;

    constructor(
        private readonly navigationService: NavigationService,
        private readonly store: Store) {
        this.streams$ = this.store.select(state => state.streamsstatemodel.streams);
    }

    ngOnInit() {
        this.streams$.subscribe((streams: StreamElement[]) => {
            this.streams = streams;
        });
    }

    onColumnSelection(index: number): boolean {
        this.navigationService.columnSelected(index);
        return false;
    }

    getDisplayableName(stream: StreamElement): string {
        let prefix = '';
        switch (stream.type) {
            case StreamTypeEnum.local:
                prefix = "local";
                break;
            case StreamTypeEnum.personnal:
                prefix = "home";
                break;
            case StreamTypeEnum.global:
                prefix = "federated";
                break;
            case StreamTypeEnum.tag:
                prefix = `#${stream.tag}`;
                break;
            case StreamTypeEnum.list:
                prefix = `${stream.list}`;
                break;
        }
        return `${prefix}@${stream.instance}`;
    }
}
