import { Component, OnInit, Input } from "@angular/core";
import { Store, Select } from '@ngxs/store';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";

import { AuthService, CurrentAuthProcess } from "../../services/auth.service";
import { TokenData } from "../../services/models/mastodon.interfaces";
import { RegisteredAppsStateModel, AppInfo } from "../../states/registered-apps.state";
import { AccountInfo, AddAccount } from "../../states/accounts.state";
import { NotificationService } from "../../services/notification.service";

@Component({
    selector: "app-register-new-account",
    templateUrl: "./register-new-account.component.html",
    styleUrls: ["./register-new-account.component.scss"]
})
export class RegisterNewAccountComponent implements OnInit {
    @Input() mastodonFullHandle: string;

    hasError: boolean;
    errorMessage: string;

    private authStorageKey: string = 'tempAuth';

    constructor(
        private readonly notificationService: NotificationService,
        private readonly authService: AuthService,
        private readonly store: Store,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router) {

        this.activatedRoute.queryParams.subscribe(params => {
            this.hasError = false;

            const code = params['code'];
            if (!code) {
                this.displayError(RegistrationErrorTypes.CodeNotFound);
                return;
            }

            const appDataWrapper = <CurrentAuthProcess>JSON.parse(localStorage.getItem(this.authStorageKey));
            if (!appDataWrapper) {
                this.displayError(RegistrationErrorTypes.AuthProcessNotFound);
                return;
            }

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
                            this.router.navigate(['/home']);
                        });
                })
                .catch((err: HttpErrorResponse) => {
                    this.notificationService.notifyHttpError(err);
                });
        });
    }

    ngOnInit() {
    }

    private displayError(type: RegistrationErrorTypes) {
        this.hasError = true;
        switch (type) {
            case RegistrationErrorTypes.AuthProcessNotFound:
                this.errorMessage = 'Something when wrong in the authentication process. Please retry.'
                break;
            case RegistrationErrorTypes.CodeNotFound:
                this.errorMessage = 'No authentication code returned. Please retry.'
                break;
        }
    }

    private getAllSavedApps(): AppInfo[] {
        const snapshot = <RegisteredAppsStateModel>this.store.snapshot().registeredapps;
        return snapshot.apps;
    }
}

enum RegistrationErrorTypes {
    CodeNotFound,
    AuthProcessNotFound
}
