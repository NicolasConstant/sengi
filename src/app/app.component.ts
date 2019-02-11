import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Select } from '@ngxs/store';
// import { ElectronService } from 'ngx-electron';

import { NavigationService, LeftPanelType } from './services/navigation.service';
import { StreamElement } from './states/streams.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {    
    title = 'Sengi';

    floatingColumnActive: boolean;
    tutorialActive: boolean;
    private columnEditorSub: Subscription;

    @Select(state => state.streamsstatemodel.streams) streamElements$: Observable<StreamElement[]>;

    constructor(private readonly navigationService: NavigationService) {
    }

    ngOnInit(): void {
        this.streamElements$.subscribe((streams: StreamElement[]) => {
            if(streams && streams.length === 0){
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
    }

    ngOnDestroy(): void {
        this.columnEditorSub.unsubscribe();
    }

}
