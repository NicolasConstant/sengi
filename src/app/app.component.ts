import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Select } from '@ngxs/store';
// import { ElectronService } from 'ngx-electron';

import { NavigationService, LeftPanelType } from './services/navigation.service';
import { StreamElement } from './states/streams.state';
import { OpenMediaEvent } from './models/common.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'Sengi';
    floatingColumnActive: boolean;
    tutorialActive: boolean;
    // mediaViewerActive: boolean = false;
    openedMediaEvent: OpenMediaEvent

    private columnEditorSub: Subscription;
    private openMediaSub: Subscription;
    private streamSub: Subscription;

    @Select(state => state.streamsstatemodel.streams) streamElements$: Observable<StreamElement[]>;

    constructor(private readonly navigationService: NavigationService) {
    }

    ngOnInit(): void {
        this.streamSub = this.streamElements$.subscribe((streams: StreamElement[]) => {
            if (streams && streams.length === 0) {
                this.tutorialActive = true;
            } else {
                this.tutorialActive = false;
            }
        });

        this.columnEditorSub = this.navigationService.activatedPanelSubject.subscribe((type: LeftPanelType) => {
            if (type === LeftPanelType.Closed) {
                this.floatingColumnActive = false;
            } else {
                this.floatingColumnActive = true;
            }
        });

        this.openMediaSub = this.navigationService.activatedMediaSubject.subscribe((openedMediaEvent: OpenMediaEvent) => {
            if (openedMediaEvent) {
                this.openedMediaEvent = openedMediaEvent;
                // this.mediaViewerActive = true;

            }
        });
    }

    ngOnDestroy(): void {
        this.streamSub.unsubscribe();
        this.columnEditorSub.unsubscribe();
        this.openMediaSub.unsubscribe();
    }

    closeMedia() {
        this.openedMediaEvent = null;
    }

    drag: boolean;
    drag2: boolean;
    private dragCounter: number = 0;

    dragenter(event): boolean {
        event.stopPropagation();
        event.preventDefault();        
        this.drag = true;
        return false;
    }
    dragleave(event): boolean {
        event.stopPropagation();
        event.preventDefault();        
        this.drag = false;
        return false;
    }
    dragover(event): boolean{
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    drop(event): boolean {
        event.stopPropagation();
        event.preventDefault();        
        
        let files = event.dataTransfer.files;
        for(let file of files){
            console.warn(file.name);
            console.warn(file);
        };

        this.drag = false;
        return false;
    }
}
