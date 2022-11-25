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
    private blockList = ['gab.com', 'gab.ai', 'cyzed.com'];
    private comradeList = ['juche.town'];

    isComrade: boolean;
    isLoading: boolean;

    private instance: string;
    @Input()
    set setInstance(value: string) {
        this.instance = value.replace('http://', '').replace('https://', '').replace('/', '').toLowerCase().trim();
        this.checkComrad();
    }
    get setInstance(): string {
        return this.instance;
    }

    constructor(
        private readonly notificationService: NotificationService,
        private readonly authService: AuthService,
        private readonly store: Store) { }

    ngOnInit() {
    }

    checkComrad(): any {
        if (this.instance) {
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
        if(this.isLoading || !this.instance) return false;

        this.isLoading = true;       

        this.checkBlockList(this.instance);
        
        this.checkAndCreateApplication(this.instance)
            .then((appData: AppData) => {
                this.redirectToInstanceAuthPage(this.instance, appData);
            })
            .then(x => {
                setTimeout(() => {
                    this.isLoading = false;    
                }, 1000);                
            })
            .catch((err: HttpErrorResponse) => {
                this.isLoading = false;
                if (err instanceof HttpErrorResponse) {
                    this.notificationService.notifyHttpError(err, null);
                } else if ((<Error>err).message === 'CORS') {
                    this.notificationService.notify(null, null, 'Connection Error. It\'s usually a CORS issue with the server you\'re connecting to. Please check in the console and if so, contact your administrator with those informations.', true);
                } else {
                    this.notificationService.notify(null, null, 'Unknown error', true);
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
            let redirect_uri = this.getLocalHostname();

            // let userAgent = navigator.userAgent.toLowerCase();
            // console.log(`userAgent ${userAgent}`);

            // if (userAgent.includes(' electron/')) {
            //     redirect_uri += '/register';
            // }

            return this.authService.createNewApplication(instance, 'Sengi', redirect_uri, 'read write follow', 'https://nicolasconstant.github.io/sengi/')
                .then((appData: AppData) => {
                    return this.saveNewApp(instance, appData)
                        .then(() => { 
                            return new Promise<AppData>(resolve => setTimeout(resolve, 1000, appData));
                        });
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

    private redirectToInstanceAuthPage(instance: string, app: AppData) {
        const appDataTemp = new CurrentAuthProcess(instance);
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
