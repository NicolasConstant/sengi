import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
// import { Store } from '@ngxs/store';
import { MastodonService, VisibilityEnum } from '../../../../services/mastodon.service';
// import { AccountInfo } from '../../../../states/accounts.state';
import { StatusWrapper } from '../../stream.component';
import { Status } from '../../../../services/models/mastodon.interfaces';
import { ToolsService } from '../../../../services/tools.service';
import { NotificationService } from '../../../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-reply-to-status',
    templateUrl: './reply-to-status.component.html',
    styleUrls: ['./reply-to-status.component.scss']
})
export class ReplyToStatusComponent implements OnInit {
    @Input() status: string = '';
    @Input() statusReplyingToWrapper: StatusWrapper;
    @Output() onClose = new EventEmitter();
    @ViewChild('reply') replyElement: ElementRef;

    private statusReplyingTo: Status;

    selectedPrivacy = 'Public';
    privacyList: string[] = ['Public', 'Unlisted', 'Follows-only', 'DM'];

    constructor(
        // private readonly store: Store,
        private readonly notificationService: NotificationService,
        private readonly toolsService: ToolsService,
        private readonly mastodonService: MastodonService) { }

    ngOnInit() {
        if (this.statusReplyingToWrapper.status.reblog) {
            this.statusReplyingTo = this.statusReplyingToWrapper.status.reblog;
        } else {
            this.statusReplyingTo = this.statusReplyingToWrapper.status;
        }

        this.status += `@${this.statusReplyingTo.account.acct} `;
        for (const mention of this.statusReplyingTo.mentions) {
            this.status += `@${mention.acct} `;
        }

        setTimeout(() => {
            this.replyElement.nativeElement.focus();
        }, 0);
    }

    onSubmit(): boolean {
        let visibility: VisibilityEnum = VisibilityEnum.Unknown;
        switch (this.selectedPrivacy) {
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

        let spoiler = this.statusReplyingTo.spoiler_text;

        const selectedAccounts = this.toolsService.getSelectedAccounts();
        for (const acc of selectedAccounts) {

            const usableStatus = this.toolsService.getStatusUsableByAccount(acc, this.statusReplyingToWrapper);
            usableStatus
                .then((status: Status) => {
                    return this.mastodonService.postNewStatus(acc, this.status, visibility, spoiler, status.id);
                })
                .then((res: Status) => {
                    console.log(res);
                    this.status = '';
                    this.onClose.emit();
                })
                .catch((err: HttpErrorResponse) => {
                    this.notificationService.notifyHttpError(err);
                });
        }

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
