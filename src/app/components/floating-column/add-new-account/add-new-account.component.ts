import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';

import { RegisteredAppsStateModel, AppInfo, AddRegisteredApp } from '../../../states/registered-apps.state';
import { AuthService, CurrentAuthProcess } from '../../../services/auth.service';
import { AppData } from '../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../services/notification.service';
import { HttpXsrfInterceptor } from '@angular/common/http/src/xsrf';

@Component({
    selector: 'app-add-new-account',
    templateUrl: './add-new-account.component.html',
    styleUrls: ['./add-new-account.component.scss']
})
export class AddNewAccountComponent implements OnInit {
    private blockList = ['gab.com', 'gab.ai', 'cyzed.com'];
    private comradeList = ['juche.town'];

    private username: string;
    private instance: string;
    isComrade: boolean;

    private _mastodonFullHandle: string;
    @Input()
    set mastodonFullHandle(value: string) {
        this._mastodonFullHandle = value;
        this.checkComrad();
    }
    get mastodonFullHandle(): string {
        return this._mastodonFullHandle;
    }

    constructor(
        private readonly notificationService: NotificationService,
        private readonly authService: AuthService,
        private readonly store: Store) { }

    ngOnInit() {
    }

    checkComrad(): any {
        let fullHandle = this.mastodonFullHandle.split('@').filter(x => x != null && x !== '');
        this.username = fullHandle[0];
        this.instance = fullHandle[1];

        if (this.username && this.instance) {
            let cleanInstance = this.instance.replace('http://', '').replace('https://', '').toLowerCase();
            for (let b of this.comradeList) {
                if (cleanInstance == b || cleanInstance.includes(`.${b}`)) {
                    this.isComrade = true;
                    return;
                }
            }
        }

        this.isComrade = false;
    }

    onSubmit(): boolean {
        // let fullHandle = this.mastodonFullHandle.split('@').filter(x => x != null && x !== '');
        // const username = fullHandle[0];
        // const instance = fullHandle[1];

        this.checkBlockList(this.instance);

        this.checkAndCreateApplication(this.instance)
            .then((appData: AppData) => {
                this.redirectToInstanceAuthPage(this.username, this.instance, appData);
            })
            .catch((err: HttpErrorResponse) => {
                if (err instanceof HttpErrorResponse) {
                    this.notificationService.notifyHttpError(err, null);
                } else if ((<Error>err).message === 'CORS') {
                    this.notificationService.notify(null, null, 'Connection Error. It\'s usually a CORS issue with the server you\'re connecting to. Please check in the console and if so, contact your administrator with those informations.', true);
                } else {
                    this.notificationService.notify(null, null, 'Unkown error', true);
                }
            });

        return false;
    }

    private checkBlockList(instance: string) {
        let cleanInstance = instance.replace('http://', '').replace('https://', '').toLowerCase();
        for (let b of this.blockList) {
            if (cleanInstance == b || cleanInstance.includes(`.${b}`)) {
                let content = '<div style="width:100%; height:100%; background-color: black;"><iframe style="pointer-events: none;" width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1&showinfo=0&controls=0" allow="autoplay; fullscreen"></div>';

                document.open();
                document.write(content);
                document.close();
                throw Error('Oh Noz!');
            }
        }
    }

    private checkAndCreateApplication(instance: string): Promise<AppData> {
        const alreadyRegisteredApps = this.getAllSavedApps();
        const instanceApps = alreadyRegisteredApps.filter(x => x.instance === instance);

        if (instanceApps.length !== 0) {
            return Promise.resolve(instanceApps[0].app);
        } else {
            const redirect_uri = this.getLocalHostname();
            return this.authService.createNewApplication(instance, 'Sengi', redirect_uri, 'read write follow', 'https://nicolasconstant.github.io/sengi/')
                .then((appData: AppData) => {
                    return this.saveNewApp(instance, appData)
                        .then(() => { return appData; });
                })
                .catch((err: HttpErrorResponse) => {
                    if (err.status === 0) {
                        throw Error('CORS');
                    } else {
                        throw err;
                    }
                });
        }
    }

    private getAllSavedApps(): AppInfo[] {
        const snapshot = <RegisteredAppsStateModel>this.store.snapshot().registeredapps;
        return snapshot.apps;
    }

    private redirectToInstanceAuthPage(username: string, instance: string, app: AppData) {
        const appDataTemp = new CurrentAuthProcess(username, instance);
        localStorage.setItem('tempAuth', JSON.stringify(appDataTemp));

        let instanceUrl = this.authService.getInstanceLoginUrl(instance, app.client_id, app.redirect_uri);

        window.location.href = instanceUrl;
    }

    private getLocalHostname(): string {
        let href = window.location.href;
        if(href.includes('/home')){
            return href.split('/home')[0];
        } else {
            return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        }
    }

    private saveNewApp(instance: string, app: AppData): Promise<any> {
        const appInfo = new AppInfo();
        appInfo.instance = instance;
        appInfo.app = app;

        return this.store.dispatch([
            new AddRegisteredApp(appInfo)
        ]).toPromise();
    }
}
