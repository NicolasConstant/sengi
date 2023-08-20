import { Component, OnInit, OnDestroy } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Subscription, Observable } from "rxjs";
import { Store } from "@ngxs/store";
import { faPlus, faCog, faSearch, faArrowsAltV } from "@fortawesome/free-solid-svg-icons";
import { faCommentAlt, faCalendarAlt } from "@fortawesome/free-regular-svg-icons";
import { HotkeysService, Hotkey } from 'angular2-hotkeys';

import { AccountWrapper } from "../../models/account.models";
import { AccountInfo, SelectAccount } from "../../states/accounts.state";
import { NavigationService, LeftPanelType } from "../../services/navigation.service";
import { UserNotificationService, UserNotification } from '../../services/user-notification.service';
import { ToolsService } from '../../services/tools.service';
import { ScheduledStatusService, ScheduledStatusNotification } from '../../services/scheduled-status.service';
import { SettingsService } from '../../services/settings.service';

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
    faArrowsAltV = faArrowsAltV;

    accounts: AccountWithNotificationWrapper[] = [];
    hasAccounts: boolean;
    hasScheduledStatuses: boolean;
    private accounts$: Observable<AccountInfo[]>;

    private accountSub: Subscription;
    private scheduledSub: Subscription;
    private notificationSub: Subscription;

    constructor(
        private readonly settingsService: SettingsService,
        private readonly hotkeysService: HotkeysService,
        private readonly scheduledStatusService: ScheduledStatusService,
        private readonly toolsService: ToolsService,
        private readonly userNotificationServiceService: UserNotificationService,
        private readonly navigationService: NavigationService,
        private readonly store: Store) {

        this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);

        this.hotkeysService.add(new Hotkey('n', (event: KeyboardEvent): boolean => {
            this.createNewStatus();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('s', (event: KeyboardEvent): boolean => {
            this.openSearch();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('a', (event: KeyboardEvent): boolean => {
            this.addNewAccount();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('c', (event: KeyboardEvent): boolean => {
            this.navigationService.openPanel(LeftPanelType.Closed);
            return false;
        }));

        this.hotkeysService.add(new Hotkey('escape', (event: KeyboardEvent): boolean => {
            this.navigationService.openPanel(LeftPanelType.Closed);
            return false;
        }));

        this.hotkeysService.add(new Hotkey('ctrl+up', (event: KeyboardEvent): boolean => {
            this.selectPreviousAccount();
            return false;
        }));

        this.hotkeysService.add(new Hotkey('ctrl+down', (event: KeyboardEvent): boolean => {
            this.selectNextAccount();
            return false;
        }));
    }

    private selectPreviousAccount() {
        let accounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        let selectedAccount = accounts.find(x => x.isSelected);
        let selectedIndex = accounts.indexOf(selectedAccount);

        if (selectedIndex > 0) {
            let previousAccount = accounts[selectedIndex - 1];
            this.store.dispatch([new SelectAccount(previousAccount)]);
        }
    }

    private selectNextAccount() {
        let accounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
        let selectedAccount = accounts.find(x => x.isSelected);
        let selectedIndex = accounts.indexOf(selectedAccount);

        if (selectedIndex < accounts.length - 1) {
            let nextAccount = accounts[selectedIndex + 1];
            this.store.dispatch([new SelectAccount(nextAccount)]);
        }
    }

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

                        this.toolsService.getAvatar(acc)
                            .then((avatar: string) => {
                                accWrapper.avatar = avatar;
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
            const settings = this.settingsService.getSettings();
            notifications.forEach((notification: UserNotification) => {
                const acc = this.accounts.find(x => x.info.id === notification.account.id);

                if (acc) {
                    const accSettings = settings.accountSettings.find(x => x.accountId === acc.info.id);
                    if (!settings.disableAvatarNotifications && !accSettings.disableAvatarNotifications) {
                        acc.hasActivityNotifications = notification.hasNewMentions || notification.hasNewNotifications;
                    }
                }
            });
        });

        this.scheduledSub = this.scheduledStatusService.scheduledStatuses.subscribe((notifications: ScheduledStatusNotification[]) => {
            let statuses = [];
            notifications.forEach(n => {
                n.statuses.forEach(x => {
                    statuses.push(x);
                })
            })

            this.hasScheduledStatuses = statuses.length > 0;
        });
    }

    ngOnDestroy(): void {
        this.accountSub.unsubscribe();
        this.notificationSub.unsubscribe();
        this.scheduledSub.unsubscribe();
    }

    onDrop(event: CdkDragDrop<AccountWithNotificationWrapper[]>) {
        console.warn(event);

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data,
                event.previousIndex,
                event.currentIndex);

            console.warn(this.accounts);
        }
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
    hasActivityNotifications: boolean;
}