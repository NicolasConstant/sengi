import { Attachment, Status } from "../services/models/mastodon.interfaces";
import { AccountInfo } from '../states/accounts.state';

export class OpenMediaEvent {
    constructor(
        public selectedIndex: number,
        public attachments: Attachment[]) {
    }
}

export class StatusWrapper {
    constructor(
        public status: Status,
        public provider: AccountInfo
    ) { }
}