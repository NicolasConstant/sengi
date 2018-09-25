import { Component, OnInit, Input } from "@angular/core";
import { Store, Select } from '@ngxs/store';
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { AuthService, CurrentAuthProcess } from "../../services/auth.service";
import { TokenData, AppData } from "../../services/models/mastodon.interfaces";
import { AddRegisteredApp, RegisteredAppsState, RegisteredAppsStateModel, AppInfo } from "../../states/registered-apps.state";
import { AccountInfo, AddAccount } from "../../states/accounts.state";
import { MastodonService } from "../../services/mastodon.service";

@Component({
    selector: "app-register-new-account",
    templateUrl: "./register-new-account.component.html",
    styleUrls: ["./register-new-account.component.scss"]
})
export class RegisterNewAccountComponent implements OnInit {
    @Input() mastodonFullHandle: string;
    result: string;

    private authStorageKey: string = 'tempAuth';

    constructor(
        private readonly authService: AuthService,
        private readonly store: Store,
        private readonly activatedRoute: ActivatedRoute) {

        this.activatedRoute.queryParams.subscribe(params => {
            const code = params['code'];
            if (!code) return;

            const appDataWrapper = <CurrentAuthProcess>JSON.parse(localStorage.getItem(this.authStorageKey));
            if (!appDataWrapper) return;

            const appInfo = this.getAllSavedApps().filter(x => x.instance === appDataWrapper.instance)[0];

            this.authService.getToken(appDataWrapper.instance, appInfo.app.client_id, appInfo.app.client_secret, code, appInfo.app.redirect_uri)
                .then((tokenData: TokenData) => {
                    const accountInfo = new AccountInfo();
                    accountInfo.username = appDataWrapper.username.toLowerCase();
                    accountInfo.instance = appDataWrapper.instance.toLowerCase();
                    accountInfo.token = tokenData;

                    this.store.dispatch([new AddAccount(accountInfo)])
                        .subscribe(() => {
                            localStorage.removeItem(this.authStorageKey);
                        });
                });
        });
    }

    ngOnInit() {
    }

    private getAllSavedApps(): AppInfo[] {
        const snapshot = <RegisteredAppsStateModel>this.store.snapshot().registeredapps;
        return snapshot.apps;
    }
}
