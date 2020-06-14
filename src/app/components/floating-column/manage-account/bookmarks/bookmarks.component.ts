import { Component, Input, ViewChild, ElementRef } from '@angular/core';

import { StatusWrapper } from '../../../../models/common.model';
import { ToolsService } from '../../../../services/tools.service';
import { AccountWrapper } from '../../../../models/account.models';
import { BookmarkResult } from '../../../../services/mastodon.service';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { Status } from '../../../../services/models/mastodon.interfaces';
import { NotificationService } from '../../../../services/notification.service';
import { TimelineBase } from '../../../../components/common/timeline-base';

@Component({
    selector: 'app-bookmarks',
    templateUrl: '../../../stream/stream-statuses/stream-statuses.component.html',
    styleUrls: ['../../../stream/stream-statuses/stream-statuses.component.scss', './bookmarks.component.scss']
})
export class BookmarksComponent extends TimelineBase {    
    private maxId: string;
    private _accountWrapper: AccountWrapper;

    @Input('account')
    set accountWrapper(acc: AccountWrapper) {
        this._accountWrapper = acc;
        this.account = acc.info;
        this.getBookmarks();
    }
    get accountWrapper(): AccountWrapper {
        return this._accountWrapper;
    }

    @ViewChild('statusstream') public statustream: ElementRef;

    constructor(
        protected readonly toolsService: ToolsService,
        protected readonly notificationService: NotificationService,
        protected readonly mastodonService: MastodonWrapperService) {

        super(toolsService, notificationService, mastodonService);
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    private reset() {
        this.isLoading = true;
        this.statuses.length = 0;
        this.maxReached = false;
        this.maxId = null;
    }

    private getBookmarks() {
        this.reset();

        this.mastodonService.getBookmarks(this.account)
            .then((result: BookmarkResult) => {
                this.maxId = result.max_id;
                for (const s of result.bookmarked) {
                    let cwPolicy = this.toolsService.checkContentWarning(s);
                    const wrapper = new StatusWrapper(cwPolicy.status, this.account, cwPolicy.applyCw, cwPolicy.hide);
                    this.statuses.push(wrapper);
                }
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err, this.account);
            })
            .then(() => {
                this.isLoading = false;
            });
    }

    protected getNextStatuses(): Promise<Status[]> {
        return this.mastodonService.getBookmarks(this.account, this.maxId)
            .then((result: BookmarkResult) => {
                const statuses = result.bookmarked;
                this.maxId = result.max_id;

                if(!this.maxId){
                    this.maxReached = true;
                }

                return statuses;
            });
    }

    protected scrolledToTop() {}

    protected  statusProcessOnGoToTop(){}
}
