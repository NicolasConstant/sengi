import { Component, OnInit, Input } from "@angular/core";
import { Store, Select } from '@ngxs/store';
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { AuthService } from "../../services/auth.service";
import { TokenData, AppData } from "../../services/models/mastodon.interfaces";
import { AccountsService } from "../../services/accounts.service";
import { AddRegisteredApp, RegisteredAppsState, RegisteredAppsStateModel } from "../../states/registered-apps.state";



@Component({
  selector: "app-register-new-account",
  templateUrl: "./register-new-account.component.html",
  styleUrls: ["./register-new-account.component.scss"]
})
export class RegisterNewAccountComponent implements OnInit {
  @Input() mastodonFullHandle: string;
  result: string;
  registeredApps$: Observable<RegisteredAppsStateModel>;

  constructor(
    private readonly authService: AuthService,
    private readonly accountsService: AccountsService,
    private readonly store: Store,
    private readonly activatedRoute: ActivatedRoute) {

    this.registeredApps$ = this.store.select(state => state.registeredapps.registeredApps);

    this.activatedRoute.queryParams.subscribe(params => {
      const code = params['code'];
      if (!code) return;

      console.warn(`got a code! ${code}`);
      const appDataWrapper = <AppDataWrapper>JSON.parse(localStorage.getItem('tempAuth'));

      console.error('got appDataWrapper from local storage');
      console.error(appDataWrapper);

      this.authService.getToken(appDataWrapper.instance, appDataWrapper.appData.client_id, appDataWrapper.appData.client_secret, code, appDataWrapper.appData.redirect_uri)
        .then(tokenData => {
          console.warn('Got token data!');
          console.warn(tokenData);

          localStorage.removeItem('tempAuth');

          //TODO review all this
          // this.accountsService.addNewAccount(appDataWrapper.instance, appDataWrapper.username, tokenData);

        });

    });

  }

  ngOnInit() {
    this.registeredApps$.subscribe(x => {
      console.error('registeredApps$')
      console.warn(x);
    });
  }

  onSubmit(): boolean {
    let fullHandle = this.mastodonFullHandle.split('@').filter(x => x != null && x !== '');

    const username = fullHandle[0];
    const instance = fullHandle[1];
   
    const redirect_uri = this.getLocalHostname() + '/register';

    this.authService.createNewApplication(instance, 'Sengi', redirect_uri,  'read write follow', 'https://github.com/NicolasConstant/sengi')
      .then((appData: AppData) => {
        this.processAndRedirectToAuthPage(username, instance, appData);
      })
      .catch(err => {
        console.error(err);
      });
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

  private processAndRedirectToAuthPage(username: string, instance: string,  app: AppData){
    const appDataTemp = new AppDataWrapper(username, instance, app);
    localStorage.setItem('tempAuth', JSON.stringify(appDataTemp));

    let instanceUrl = `https://${instance}/oauth/authorize?scope=${encodeURIComponent('read write follow')}&response_type=code&redirect_uri=${encodeURIComponent(app.redirect_uri)}&client_id=${app.client_id}`;

    window.location.href = instanceUrl;
  }
}

class AppDataWrapper {
  constructor(public username: string, public instance: string, public appData: AppData) {

  }
}