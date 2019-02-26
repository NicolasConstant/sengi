import { Attachment } from "../services/models/mastodon.interfaces";

export class OpenMediaEvent {
    constructor(
        public selectedIndex: number,
        public attachments: Attachment[]) {
    }
}