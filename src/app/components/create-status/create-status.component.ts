import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { MastodonService, VisibilityEnum } from '../../services/mastodon.service';
import { Status } from '../../services/models/mastodon.interfaces';
import { ToolsService } from '../../services/tools.service';
import { NotificationService } from '../../services/notification.service';
import { StatusWrapper } from '../../models/common.model';

@Component({
    selector: 'app-create-status',
    templateUrl: './create-status.component.html',
    styleUrls: ['./create-status.component.scss']
})
export class CreateStatusComponent implements OnInit {
    title: string;
    status: string = '';

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
        if (this.statusReplyingToWrapper) {
            if (this.statusReplyingToWrapper.status.reblog) {
                this.statusReplyingTo = this.statusReplyingToWrapper.status.reblog;
            } else {
                this.statusReplyingTo = this.statusReplyingToWrapper.status;
            }

            // const mentions = [...this.statusReplyingTo.mentions.map(x => x.acct), this.statusReplyingTo.account.acct];
            // let uniqueMentions = [];
            // for(const mention of mentions){
            //     if(!uniqueMentions.includes(mention)){
            //         uniqueMentions.push(mention);
            //     }
            // }

            const uniqueMentions = this.getMentions(this.statusReplyingTo);
            for (const mention of uniqueMentions) {
                this.status += `@${mention} `;
            }
        }

        setTimeout(() => {
            this.replyElement.nativeElement.focus();
        }, 0);
    }

    private getMentions(status: Status): string[]{
        const mentions = [...status.mentions.map(x => x.acct), status.account.acct];
        let uniqueMentions = [];
        for(let mention of mentions){
            if(!uniqueMentions.includes(mention)){
                // if(!mention.includes('@')){
                //     mention += `@${status.}`;
                // }
                uniqueMentions.push(mention);
            }
        }        
        return uniqueMentions;      
    }

    onSubmit(): boolean {
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
        if (this.statusReplyingToWrapper) {
            spoiler = this.statusReplyingTo.spoiler_text;
        }

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
