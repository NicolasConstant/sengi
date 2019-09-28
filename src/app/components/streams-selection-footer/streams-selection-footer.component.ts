import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';

import { StreamElement, StreamTypeEnum } from '../../states/streams.state';
import { NavigationService } from '../../services/navigation.service';

@Component({
    selector: 'app-streams-selection-footer',
    templateUrl: './streams-selection-footer.component.html',
    styleUrls: ['./streams-selection-footer.component.scss']
})
export class StreamsSelectionFooterComponent implements OnInit {
    streams: SelectableStream[] = [];
    private streams$: Observable<StreamElement[]>;

    constructor(
        private readonly hotkeysService: HotkeysService,
        private readonly navigationService: NavigationService,
        private readonly store: Store) {
        this.streams$ = this.store.select(state => state.streamsstatemodel.streams);

        this.hotkeysService.add(new Hotkey('ctrl+right', (event: KeyboardEvent): boolean => {
            this.nextColumnSelected();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('ctrl+left', (event: KeyboardEvent): boolean => {
            this.previousColumnSelected();
            return false;
        }));
    }

    ngOnInit() {
        this.streams$.subscribe((streams: StreamElement[]) => {
            this.streams = streams.map(x => new SelectableStream(x));
        });
    }

    private nextColumnSelected() {
        const nbStreams =  this.streams.length;
        const selectedElement = this.streams.find(x => x.isSelected);
        let currentSelectionIndex = 0;
        if (selectedElement) {
            currentSelectionIndex = this.streams.indexOf(selectedElement);
        }

        if(currentSelectionIndex < nbStreams - 1){
            this.onColumnSelection(currentSelectionIndex + 1);
        }
    }

    private previousColumnSelected() {
        const selectedElement = this.streams.find(x => x.isSelected);
        let currentSelectionIndex = 0;
        if (selectedElement) {
            currentSelectionIndex = this.streams.indexOf(selectedElement);
        }

        if(currentSelectionIndex > 0){
            this.onColumnSelection(currentSelectionIndex - 1);
        } else {
            this.onColumnSelection(0);
        }
    }

    onColumnSelection(index: number): boolean {
        this.streams.forEach(x => x.isSelected = false);

        const selectedStream = this.streams[index];
        selectedStream.isSelected = true;

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

class SelectableStream {
    constructor(public readonly stream: StreamElement) {
    }

    isSelected: boolean;
}
