import { PlatformLocation } from '@angular/common';

export interface AppData {
    client_id: string;
    client_secret: string;
    id: string;
    name: string;
    redirect_uri: string;
    website: string;
}

export interface TokenData {
    access_token: string;
    token_type: string;
    scope: string;
    created_at: number;

    //TODO: Pleroma support this
    me: string;
    expires_in: number;
    refresh_token: string;
}

export interface Account {
    id: number;
    username: string;
    acct: string;
    display_name: string;
    locked: boolean;
    created_at: string;
    followers_count: number;
    following_count: number;
    statuses_count: number;
    note: string;
    url: string;
    avatar: string;
    avatar_static: string;
    header: string;
    header_static: string;
    emojis: Emoji[];
    moved: Account;
    fields: Field[];
    bot: boolean;
    source: AccountInfo;
}

export interface AccountInfo {
    privacy: string;
    sensitive: boolean;
    note: string;
    fields: Field[];
}

export interface Emoji {
    shortcode: string;
    static_url: string;
    url: string;
    visible_in_picker: boolean;
}

export interface Field {
    name: string;
    value: string;
    verified_at: string;
}

export interface Application {
    name: string;
    website: string;
}

export interface Attachment {
    id: string;
    type: 'image' | 'video' | 'gifv' | 'audio';
    url: string;
    remote_url: string;
    preview_url: string;
    text_url: string;
    meta: any;
    description: string;

    pleroma: PleromaAttachment;
}

export interface PleromaAttachment {
    mime_type: string;
}

export interface Card {
    url: string;
    title: string;
    description: string;
    image: string;
    type: 'link' | 'photo' | 'video' | 'rich';
    author_name: string;
    author_url: string;
    provider_name: string;
    provider_url: string;
    html: any;
    width: number;
    height: number;
}

export interface Context {
    ancestors: Status[];
    descendants: Status[];
}

export interface Error {
    error: string;
}



export interface Instance {
    title: string;
    version: string;
    description: string;   
}

export interface Instancev1 extends Instance {
    uri: string;
    email: string;    
    urls: InstanceUrls;
    contact_account: Account;
    max_toot_chars: number;
    configuration: Instancev2Configuration;
}

export interface Instancev2 extends Instance {
    configuration: Instancev2Configuration
}

export interface Instancev2Configuration {
    urls: Instancev2Urls;
    statuses: Instancev2Statuses;
    translation: Instancev2Translation;
}

export interface InstanceUrls {
    streaming_api: string;
}

export interface Instancev2Urls {
    streaming: string;    
}

export interface Instancev2Statuses {
    max_characters: number;
}

export interface Instancev2Translation {
    enabled: boolean;
}

export interface Mention {
    url: string;
    username: string;
    acct: string;
    id: string;
}

export interface Notification {
    id: string;
    type: 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'follow_request' | 'move' | 'update';
    created_at: string;
    account: Account;
    status?: Status;
    target?: Account; //for move Pleroma's notification
}

export interface Relationship {
    id: number;
    following: boolean;
    followed_by: boolean;
    blocked_by: boolean;
    blocking: boolean;
    domain_blocking: boolean;
    muting: boolean;
    muting_notifications: boolean;
    requested: boolean;
    showing_reblogs: boolean;
    endorsed: boolean;
}

export interface Report {
    id: string;
    action_taken: boolean;
}

export interface Results {
    accounts: Account[];
    statuses: Status[];
    hashtags: string[];
}

export interface Status {
    id: string;
    uri: string;
    url: string;
    account: Account;
    in_reply_to_id: string;
    in_reply_to_account_id: number;
    reblog: Status;
    content: string;
    created_at: string;
    edited_at: string;
    reblogs_count: number;
    replies_count: number;
    favourites_count: string;
    reblogged: boolean;
    favourited: boolean;
    sensitive: boolean;
    spoiler_text: string;
    visibility: 'public' | 'unlisted' | 'private' | 'direct';
    media_attachments: Attachment[];
    mentions: Mention[];
    tags: Tag[];
    application: Application;
    emojis: Emoji[];
    language: string;
    pinned: boolean;
    muted: boolean;
    bookmarked: boolean;
    card: Card;
    poll: Poll;

    pleroma: PleromaStatusInfo;
}

export interface Conversation {
    id: string;
    accounts: Account[];
    last_status: Status;
    unread: boolean;
}

export interface PleromaStatusInfo {
    conversation_id: number;
    local: boolean;
}

export interface List {
    id: string;
    title: string;
}

export interface Poll {
    id: string;
    expires_at: string;
    expired: boolean;
    multiple: boolean;
    votes_count: number;
    voters_count: number;
    options: PollOption[];
    voted: boolean;
}

export interface PollOption {
    title: string;
    votes_count: number;
}

export interface ScheduledStatus {
    id: string;
    scheduled_at: string;
    params: StatusParams;
    media_attachments: Attachment[];
}

export interface StatusParams {
    text: string;
    in_reply_to_id: string;
    media_ids: string[];
    sensitive: boolean;
    spoiler_text: string;
    visibility: 'public' | 'unlisted' | 'private' | 'direct';
    scheduled_at: string;
    application_id: string;
}

export interface TagHistory {
    day: string;
    uses: number;
    accounts: number;
}

export interface Tag {
    name: string;
    url: string;
    history: TagHistory[];
    following: boolean;
}

export interface Translation {
    content: string;
    language: string;
    detected_source_language: string;
    provider: string;
    spoiler_text: string;
}