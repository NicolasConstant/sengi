import { SafeHtml } from '@angular/platform-browser';

import { Attachment, Status } from "../services/models/mastodon.interfaces";
import { AccountInfo } from '../states/accounts.state';


export class OpenMediaEvent {
    constructor(
        public selectedIndex: number,
        public attachments: Attachment[],
        public iframe: SafeHtml) {
    }
}

export class StatusWrapper {
    constructor(
        public status: Status,
        public provider: AccountInfo, 
        public applyCw: boolean, 
        public hide: boolean
    ) { }

    public isSelected: boolean;
}