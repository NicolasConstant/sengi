import { Component, OnInit, Input } from "@angular/core";
import { Store, Select } from '@ngxs/store';

import { AuthService } from "../../services/auth.service";
import { TokenData, AppData } from "../../services/models/mastodon.interfaces";
import { AccountsService } from "../../services/accounts.service";
import { AddRegisteredApp, RegisteredAppsState, RegisteredAppsStateModel } from "../../states/registered-apps.state";
import { Observable } from "rxjs";
import { AppService } from "../../services/app.service";
import { ActivatedRoute } from "@angular/router";

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
    private readonly appService: AppService,
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
    console.log(`username ${username} instance ${instance}`);

    let localUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');

    if (localUrl === 'file://') {
      localUrl = 'http://localhost:4200';
    }
    const redirect_uri = localUrl + '/register';

    this.appService.createNewApplication(instance, redirect_uri)
      .then((appData: AppData) => {

        const appDataTemp = new AppDataWrapper(username, instance, appData);
        localStorage.setItem('tempAuth', JSON.stringify(appDataTemp));

        let instanceUrl = `https://${instance}/oauth/authorize?scope=${encodeURIComponent('read write follow')}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&client_id=${appData.client_id}`;

        window.location.href = instanceUrl;
      });
    return false;
  }
}

class AppDataWrapper {
  constructor(public username: string, public instance: string, public appData: AppData) {

  }
}