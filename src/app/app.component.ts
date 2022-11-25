import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';

import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { NavigationService, LeftPanelType, OpenLeftPanelEvent } from './services/navigation.service';
import { StreamElement } from './states/streams.state';
import { AccountInfo, AddAccount } from "./states/accounts.state";
import { OpenMediaEvent } from './models/common.model';
import { ToolsService } from './services/tools.service';
import { MediaService } from './services/media.service';
import { ServiceWorkerService } from './services/service-worker.service';
import { AuthService, CurrentAuthProcess } from './services/auth.service';

import { MastodonWrapperService } from './services/mastodon-wrapper.service';
import { TokenData, Account } from './services/models/mastodon.interfaces';
import { NotificationService } from './services/notification.service';
import { AppInfo, RegisteredAppsStateModel } from './states/registered-apps.state';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    faTimes = faTimes;
    title = 'Sengi';
    floatingColumnActive: boolean;
    tutorialActive: boolean;
    openedMediaEvent: OpenMediaEvent

    restartNotificationLabel: string;
    restartNotificationAvailable: boolean;
    showRestartNotification: boolean;

    private authStorageKey: string = 'tempAuth';

    private columnEditorSub: Subscription;
    private openMediaSub: Subscription;
    private streamSub: Subscription;
    private dragoverSub: Subscription;
    private paramsSub: Subscription;
    private restartNotificationSub: Subscription;

    @Select(state => state.streamsstatemodel.streams) streamElements$: Observable<StreamElement[]>;

    constructor(
        private readonly router: Router,
        private readonly notificationService: NotificationService,
        private readonly store: Store,
        private readonly mastodonService: MastodonWrapperService,
        private readonly authService: AuthService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly serviceWorkerService: ServiceWorkerService, // Ensure update checks
        private readonly toolsService: ToolsService,
        private readonly mediaService: MediaService,
        private readonly navigationService: NavigationService) {
    }

    ngOnInit(): void {
        this.paramsSub = this.activatedRoute.queryParams.subscribe(params => {
            const code = params['code'];
            if (!code) {
                return;
            }

            const appDataWrapper = <CurrentAuthProcess>JSON.parse(localStorage.getItem(this.authStorageKey));
            if (!appDataWrapper) {
                this.notificationService.notify('', 400, 'Something when wrong in the authentication process. Please retry.', true);
                this.router.navigate(['/']);
                return;
            }

            const appInfo = this.getAllSavedApps().filter(x => x.instance === appDataWrapper.instance)[0];
            let usedTokenData: TokenData;
            this.authService.getToken(appDataWrapper.instance, appInfo.app.client_id, appInfo.app.client_secret, code, appInfo.app.redirect_uri)
                .then((tokenData: TokenData) => {

                    if (tokenData.refresh_token && !tokenData.created_at) {
                        const nowEpoch = Date.now() / 1000 | 0;
                        tokenData.created_at = nowEpoch;
                    }

                    usedTokenData = tokenData;

                    return this.mastodonService.retrieveAccountDetails({ 'instance': appDataWrapper.instance, 'id': '', 'username': '', 'order': 0, 'isSelected': true, 'token': tokenData });
                })
                .then((account: Account) => {
                    var username = account.username.toLowerCase();
                    var instance = appDataWrapper.instance.toLowerCase();

                    if (this.isAccountAlreadyPresent(username, instance)) {
                        this.notificationService.notify(null, null, `Account @${username}@${instance} is already registered`, true);
                        this.router.navigate(['/']);
                        return;
                    }

                    const accountInfo = new AccountInfo();
                    accountInfo.username = username;
                    accountInfo.instance = instance;
                    accountInfo.token = usedTokenData;

                    this.store.dispatch([new AddAccount(accountInfo)])
                        .subscribe(() => {
                            localStorage.removeItem(this.authStorageKey);
                            this.router.navigate(['/']);
                        });
                })
                .catch((err: HttpErrorResponse) => {
                    this.notificationService.notifyHttpError(err, null);
                    this.router.navigate(['/']);
                });
        });

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

                this.checkEnhancedTutorial();
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
            });

        this.restartNotificationSub = this.notificationService.restartNotificationStream.subscribe((label: string) => {
            if (label) {
                this.displayRestartNotification(label);
            }
        });
    }

    enhancedTutorialActive: boolean;
    enhancedTutorialVisible: boolean;
    private checkEnhancedTutorial() {
        let enhancedTutorialDeactivated = JSON.parse(localStorage.getItem('tutorial'));
        if (!this.floatingColumnActive && !this.tutorialActive && !enhancedTutorialDeactivated) {
            setTimeout(() => {
                this.enhancedTutorialActive = true;
                setTimeout(() => {
                    this.enhancedTutorialVisible = true;
                }, 100);
            }, 500);
        }
    }

    closeTutorial(){
        localStorage.setItem('tutorial', JSON.stringify(true));

        this.enhancedTutorialVisible = false;
        setTimeout(() => {
            this.enhancedTutorialActive = false;
        }, 400);        
    }

    ngOnDestroy(): void {
        this.streamSub.unsubscribe();
        this.columnEditorSub.unsubscribe();
        this.openMediaSub.unsubscribe();
        this.dragoverSub.unsubscribe();
        this.paramsSub.unsubscribe();
        this.restartNotificationSub.unsubscribe();
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

    loadNewVersion(): boolean {
        document.location.reload();
        // this.serviceWorkerService.loadNewAppVersion();
        return false;
    }

    displayRestartNotification(label: string): boolean {
        this.restartNotificationLabel = label;
        this.showRestartNotification = true;
        setTimeout(() => {
            this.restartNotificationAvailable = true;
        }, 200);

        return false;
    }

    closeRestartNotification(): boolean {
        this.restartNotificationAvailable = false;
        setTimeout(() => {
            this.showRestartNotification = false;
        }, 250);

        return false;
    }

    private isAccountAlreadyPresent(username: string, instance: string): boolean {
        const accounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        for (let acc of accounts) {
            if (acc.instance === instance && acc.username == username) {
                return true;
            }
        }
        return false;
    }

    private getAllSavedApps(): AppInfo[] {
        const snapshot = <RegisteredAppsStateModel>this.store.snapshot().registeredapps;
        return snapshot.apps;
    }
}
