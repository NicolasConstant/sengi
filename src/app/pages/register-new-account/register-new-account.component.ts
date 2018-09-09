import { Component, OnInit, Input } from "@angular/core";
import { Store, Select } from '@ngxs/store';
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { AuthService } from "../../services/auth.service";
import { TokenData, AppData } from "../../services/models/mastodon.interfaces";
import { AccountsService } from "../../services/accounts.service";
import { AddRegisteredApp, RegisteredAppsState, RegisteredAppsStateModel, AppInfo } from "../../states/registered-apps.state";
import { AccountInfo, AddAccount } from "../../states/accounts.state";

@Component({
  selector: "app-register-new-account",
  templateUrl: "./register-new-account.component.html",
  styleUrls: ["./register-new-account.component.scss"]
})
export class RegisterNewAccountComponent implements OnInit {
  @Input() mastodonFullHandle: string;
  result: string;
  // registeredApps$: Observable<RegisteredAppsStateModel>;

  private authStorageKey: string = 'tempAuth';

  constructor(
    private readonly authService: AuthService,
    private readonly accountsService: AccountsService,
    private readonly store: Store,
    private readonly activatedRoute: ActivatedRoute) {

    // this.registeredApps$ = this.store.select(state => state.registeredapps.registeredApps);

    this.activatedRoute.queryParams.subscribe(params => {
      const code = params['code'];
      if (!code) return;

      const appDataWrapper = <CurrentAuthProcess>JSON.parse(localStorage.getItem(this.authStorageKey));
      if(!appDataWrapper) return;

      const appInfo = this.getAllSavedApps().filter(x => x.instance === appDataWrapper.instance)[0];
      console.warn('appInfo');
      console.warn(appInfo);

      this.authService.getToken(appDataWrapper.instance, appInfo.app.client_id, appInfo.app.client_secret, code, appInfo.app.redirect_uri)
        .then((tokenData: TokenData) => {
          const accountInfo = new AccountInfo();
          accountInfo.username = appDataWrapper.username;
          accountInfo.instance = appDataWrapper.instance;
          accountInfo.token= tokenData;

          this.store.dispatch([new AddAccount(accountInfo)])
            .subscribe(() => {
              localStorage.removeItem(this.authStorageKey);
            });
        });

    });

  }

  ngOnInit() {
    // this.registeredApps$.subscribe(x => {
    //   console.error('registeredApps$')
    //   console.warn(x);
    // });
  }

  onSubmit(): boolean {
    let fullHandle = this.mastodonFullHandle.split('@').filter(x => x != null && x !== '');

    const username = fullHandle[0];
    const instance = fullHandle[1];

    const alreadyRegisteredApps = this.getAllSavedApps();
    const instanceApps = alreadyRegisteredApps.filter(x => x.instance === instance);

    if (instanceApps.length !== 0) {
      console.log('instance already registered');
      const appData = instanceApps[0].app;
      this.redirectToInstanceAuthPage(username, instance, appData);

    } else {
      console.log('instance not registered');
      const redirect_uri = this.getLocalHostname() + '/register';
      this.authService.createNewApplication(instance, 'Sengi', redirect_uri, 'read write follow', 'https://github.com/NicolasConstant/sengi')
        .then((appData: AppData) => {
          this.saveNewApp(instance, appData)
            .then(() => {
              this.redirectToInstanceAuthPage(username, instance, appData);
            });
        })
        .catch(err => {
          console.error(err);
        });
    }
    return false;
  }

  private getLocalHostname(): string {
    let localHostname = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

    //Electron hack
    if (localHostname === 'file://') {
      localHostname = 'http://localhost:4200';
    }

    return localHostname;
  }

  private getAllSavedApps(): AppInfo[] {
    const snapshot = <RegisteredAppsStateModel>this.store.snapshot().registeredapps;
    return snapshot.apps;
  }

  private saveNewApp(instance: string, app: AppData): Promise<any> {
    const appInfo = new AppInfo();
    appInfo.instance = instance;
    appInfo.app = app;

    return this.store.dispatch([
      new AddRegisteredApp(appInfo)
    ]).toPromise();
  }

  private redirectToInstanceAuthPage(username: string, instance: string, app: AppData) {
    const appDataTemp = new CurrentAuthProcess(username, instance);
    localStorage.setItem('tempAuth', JSON.stringify(appDataTemp));

    let instanceUrl = `https://${instance}/oauth/authorize?scope=${encodeURIComponent('read write follow')}&response_type=code&redirect_uri=${encodeURIComponent(app.redirect_uri)}&client_id=${app.client_id}`;

    window.location.href = instanceUrl;
  }
}

class CurrentAuthProcess {
  constructor(public username: string, public instance: string) { }
}