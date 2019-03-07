import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { Subscription, Observable } from 'rxjs';

import { MastodonService, VisibilityEnum } from '../../services/mastodon.service';
import { Status } from '../../services/models/mastodon.interfaces';
import { ToolsService } from '../../services/tools.service';
import { NotificationService } from '../../services/notification.service';
import { StatusWrapper } from '../../models/common.model';
import { AccountInfo } from '../../states/accounts.state';
import { InstancesInfoService } from '../../services/instances-info.service';


@Component({
    selector: 'app-create-status',
    templateUrl: './create-status.component.html',
    styleUrls: ['./create-status.component.scss']
})
export class CreateStatusComponent implements OnInit, OnDestroy {
    title: string;

    private _status: string = '';
    set status(value: string){        
        this.countStatusChar(value);
        this._status = value;        
    }
    get status(): string {
        return this._status;
    }

    private maxCharLength: number;
    charCountLeft: number;
    postCounts: number = 1;

    isSending: boolean;

    @Input() statusReplyingToWrapper: StatusWrapper;
    @Output() onClose = new EventEmitter();
    @ViewChild('reply') replyElement: ElementRef;

    private statusReplyingTo: Status;

    selectedPrivacy = 'Public';
    privacyList: string[] = ['Public', 'Unlisted', 'Follows-only', 'DM'];

    private accounts$: Observable<AccountInfo[]>;
    private accountSub: Subscription;

    constructor(
        private readonly store: Store,
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService,
        private readonly instancesInfoService: InstancesInfoService) { 
            this.accounts$ = this.store.select(state => state.registeredaccounts.accounts);
        }

    ngOnInit() {
        this.accountSub = this.accounts$.subscribe((accounts: AccountInfo[]) => {
            this.accountChanged(accounts);
        });

        if (this.statusReplyingToWrapper) {
            if (this.statusReplyingToWrapper.status.reblog) {
                this.statusReplyingTo = this.statusReplyingToWrapper.status.reblog;
            } else {
                this.statusReplyingTo = this.statusReplyingToWrapper.status;
            }

            const uniqueMentions = this.getMentions(this.statusReplyingTo, this.statusReplyingToWrapper.provider);
            for (const mention of uniqueMentions) {
                this.status += `@${mention} `;
            }

            this.title = this.statusReplyingTo.spoiler_text;
        }

        setTimeout(() => {
            this.replyElement.nativeElement.focus();
        }, 0);
    }

    ngOnDestroy(){
        this.accountSub.unsubscribe();
    }

    private accountChanged(accounts: AccountInfo[]): void {
        const selectedAccount = accounts.filter(x => x.isSelected)[0];
        this.instancesInfoService.getMaxStatusChars(selectedAccount.instance)
            .then((maxChars: number) => {
                this.maxCharLength = maxChars;
                this.countStatusChar(this.status);
            });
    }

    private countStatusChar(status: string){
        // const maxLength = 500;
        const statusLength = status.length;
        const mod = statusLength % this.maxCharLength;
        this.charCountLeft = this.maxCharLength - mod;
        this.postCounts = Math.trunc(statusLength/this.maxCharLength) + 1;
    }

    private getMentions(status: Status, providerInfo: AccountInfo): string[] {
        const mentions = [...status.mentions.map(x => x.acct), status.account.acct];

        let uniqueMentions = [];
        for (let mention of mentions) {
            if (!uniqueMentions.includes(mention)) {
                uniqueMentions.push(mention);
            }
        }

        let globalUniqueMentions = [];
        for (let mention of uniqueMentions) {
            if (!mention.includes('@')) {
                mention += `@${providerInfo.instance}`;
            }
            globalUniqueMentions.push(mention);
        }

        return globalUniqueMentions;
    }

    onSubmit(): boolean {
        if (this.isSending) return false;

        this.isSending = true;

        let visibility: VisibilityEnum = VisibilityEnum.Unknown;
        switch (this.selectedPrivacy) { //FIXME: in case of responding, set the visibility to original
            case 'Public':
                visibility = VisibilityEnum.Public;
                break;
            case 'Unlisted':
                visibility = VisibilityEnum.Unlisted;
                break;
            case 'Follows-only':
                visibility = VisibilityEnum.Private;
                break;
            case 'DM':
                visibility = VisibilityEnum.Direct;
                break;
        }

        let spoiler = this.title;


        const acc = this.toolsService.getSelectedAccounts()[0];

        let usableStatus: Promise<Status>;
        if (this.statusReplyingToWrapper) {
            usableStatus = this.toolsService.getStatusUsableByAccount(acc, this.statusReplyingToWrapper);
        } else {
            usableStatus = Promise.resolve(null);
        }

        usableStatus
            .then((status: Status) => {
                let inReplyToId = null;
                if (status) {
                    inReplyToId = status.id;
                }
                return this.mastodonService.postNewStatus(acc, this.status, visibility, spoiler, inReplyToId);
            })
            .then((res: Status) => {
                this.title = '';
                this.status = '';
                this.onClose.emit();
            })
            .catch((err: HttpErrorResponse) => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.isSending = false;
            });

        return false;
    }

    // private getRegisteredAccounts(): AccountInfo[] {
    //     var regAccounts = <AccountInfo[]>this.store.snapshot().registeredaccounts.accounts;
    //     return regAccounts;
    // }

    onCtrlEnter(): boolean {
        this.onSubmit();
        return false;
    }
}
