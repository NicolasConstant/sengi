import { Component, OnInit, OnDestroy } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription, Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { faPlus, faCog, faSearch } from "@fortawesome/free-solid-svg-icons";
import { faCommentAlt, faCalendarAlt } from "@fortawesome/free-regular-svg-icons";

import { Account } from "../../services/models/mastodon.interfaces";
import { AccountWrapper } from "../../models/account.models";
import { AccountInfo, SelectAccount } from "../../states/accounts.state";
import { NavigationService, LeftPanelType } from "../../services/navigation.service";
import { MastodonService } from "../../services/mastodon.service";
import { NotificationService } from "../../services/notification.service";
import { UserNotificationService, UserNotification } from '../../services/user-notification.service';

@Component({
    selector: "app-left-side-bar",
    templateUrl: "./left-side-bar.component.html",
    styleUrls: ["./left-side-bar.component.scss"]
})
export class LeftSideBarComponent implements OnInit, OnDestroy {
    faCommentAlt = faCommentAlt;
    faSearch = faSearch;
    faPlus = faPlus;    
    faCog = faCog;
    faCalendarAlt = faCalendarAlt;

    accounts: AccountWithNotificationWrapper[] = [];
    hasAccounts: boolean;
    private accounts$: Observable<AccountInfo[]>;

    private accountSub: Subscription;
    private notificationSub: Subscription;

    constructor(
        private readonly userNotificationServiceService: UserNotificationService,
        private readonly notificationService: NotificationService,
        private readonly navigationService: NavigationService,
        private readonly mastodonService: MastodonService,
        private readonly store: Store) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
    }

    private currentLoading: number;
    ngOnInit() {
        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            if (accounts) {
                //Update and Add
                for (let acc of accounts) {
                    const previousAcc = this.accounts.find(x => x.info.id === acc.id)
                    if (previousAcc) {
                        previousAcc.info.isSelected = acc.isSelected;
                    } else {
                        const accWrapper = new AccountWithNotificationWrapper();
                        accWrapper.info = acc;

                        this.accounts.push(accWrapper);

                        this.mastodonService.retrieveAccountDetails(acc)
                            .then((result: Account) => {
                                accWrapper.avatar = result.avatar;
                            })
                            .catch((err: HttpErrorResponse) => {
                                this.notificationService.notifyHttpError(err);
                            });
                    }
                }

                //Delete
                const deletedAccounts = this.accounts.filter(x => accounts.findIndex(y => y.id === x.info.id) === -1);
                for (let delAcc of deletedAccounts) {
                    this.accounts = this.accounts.filter(x => x.info.id !== delAcc.info.id);
                }

                this.hasAccounts = this.accounts.length > 0;
            }
        });

        this.notificationSub = this.userNotificationServiceService.userNotifications.subscribe((notifications: UserNotification[]) => {
            notifications.forEach((notification: UserNotification) => {
                const acc = this.accounts.find(x => x.info.id === notification.account.id);
                if(acc){
                    acc.hasActivityNotifications = notification.hasNewMentions || notification.hasNewNotifications;
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.accountSub.unsubscribe();
        this.notificationSub.unsubscribe();
    }

    onToogleAccountNotify(acc: AccountWrapper) {
        this.store.dispatch([new SelectAccount(acc.info)]);
    }

    onOpenMenuNotify(acc: AccountWrapper) {
        this.navigationService.openColumnEditor(acc);
    }

    createNewStatus(): boolean {
        this.navigationService.openPanel(LeftPanelType.CreateNewStatus);
        return false;
    }

    openSearch(): boolean {
        this.navigationService.openPanel(LeftPanelType.Search);
        return false;
    }

    addNewAccount(): boolean {
        this.navigationService.openPanel(LeftPanelType.AddNewAccount);
        return false;
    }

    openSettings(): boolean {
        this.navigationService.openPanel(LeftPanelType.Settings);
        return false;
    }

    openScheduledStatuses(): boolean {
        this.navigationService.openPanel(LeftPanelType.ScheduledStatuses);
        return false;
    }
}

export class AccountWithNotificationWrapper extends AccountWrapper {
    // constructor(accountWrapper: AccountWrapper) {
    //     super();

    //     this.avatar = accountWrapper.avatar;
    //     this.info = accountWrapper.info;
    // }

    hasActivityNotifications: boolean;
}