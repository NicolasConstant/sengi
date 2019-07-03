import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Select } from '@ngxs/store';
// import { ElectronService } from 'ngx-electron';

import { NavigationService, LeftPanelType, OpenLeftPanelEvent } from './services/navigation.service';
import { StreamElement } from './states/streams.state';
import { OpenMediaEvent } from './models/common.model';
import { ToolsService } from './services/tools.service';
import { MediaService } from './services/media.service';

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
    private dragoverSub: Subscription;

    @Select(state => state.streamsstatemodel.streams) streamElements$: Observable<StreamElement[]>;

    constructor(
        private readonly toolsService: ToolsService,
        private readonly mediaService: MediaService,
        private readonly navigationService: NavigationService) {
    }

    ngOnInit(): void {
        this.streamSub = this.streamElements$.subscribe((streams: StreamElement[]) => {
            if (streams && streams.length === 0) {
                this.tutorialActive = true;
            } else {
                this.tutorialActive = false;
            }
        });

        this.columnEditorSub = this.navigationService.activatedPanelSubject.subscribe((event: OpenLeftPanelEvent) => {
            if (event.type === LeftPanelType.Closed) {
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


        this.dragoverSub = this.dragoverSubject
            .pipe(
                debounceTime(1500)
            )
            .subscribe(() => {                
                this.drag = false;
            })
    }

    ngOnDestroy(): void {
        this.streamSub.unsubscribe();
        this.columnEditorSub.unsubscribe();
        this.openMediaSub.unsubscribe();
        this.dragoverSub.unsubscribe();
    }

    closeMedia() {
        this.openedMediaEvent = null;
    }

    private dragoverSubject = new Subject<boolean>();
    drag: boolean;
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
    dragover(event): boolean {
        // console.warn('dragover');
        event.stopPropagation();
        event.preventDefault();
        this.dragoverSubject.next(true);
        return false;
    }
    drop(event): boolean {
        event.stopPropagation();
        event.preventDefault();
        this.drag = false;

        let files = <File[]>event.dataTransfer.files;
        const selectedAccount = this.toolsService.getSelectedAccounts()[0];
        this.mediaService.uploadMedia(selectedAccount, files);
        return false;
    }
}
