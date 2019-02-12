import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';

import { RegisteredAppsStateModel, AppInfo, AddRegisteredApp } from '../../../states/registered-apps.state';
import { AuthService, CurrentAuthProcess } from '../../../services/auth.service';
import { AppData } from '../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../services/notification.service';

@Component({
    selector: 'app-add-new-account',
    templateUrl: './add-new-account.component.html',
    styleUrls: ['./add-new-account.component.scss']
})
export class AddNewAccountComponent implements OnInit {
    @Input() mastodonFullHandle: string;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly authService: AuthService,
        private readonly store: Store) { }

    ngOnInit() {
    }

    onSubmit(): boolean {
        let fullHandle = this.mastodonFullHandle.split('@').filter(x => x != null && x !== '');

        const username = fullHandle[0];
        const instance = fullHandle[1];

        this.checkAndCreateApplication(instance)
            .then((appData: AppData) => {
                this.redirectToInstanceAuthPage(username, instance, appData);
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            });

        return false;
    }

    private checkAndCreateApplication(instance: string): Promise<AppData> {
        const alreadyRegisteredApps = this.getAllSavedApps();
        const instanceApps = alreadyRegisteredApps.filter(x => x.instance === instance);

        if (instanceApps.length !== 0) {
            return Promise.resolve(instanceApps[0].app);
        } else {
            const redirect_uri = this.getLocalHostname() + '/register';
            return this.authService.createNewApplication(instance, 'Sengi', redirect_uri, 'read write follow', 'https://github.com/NicolasConstant/sengi')
                .then((appData: AppData) => {
                    return this.saveNewApp(instance, appData)
                        .then(() => { return appData; });
                })
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
        let localHostname = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
        return localHostname;
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
