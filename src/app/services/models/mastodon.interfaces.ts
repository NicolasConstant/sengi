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
    locked: string;
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
    moved: boolean;
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
    uri: string;
    title: string;
    description: string;
    email: string;
    version: string;
    urls: string[];
    contact_account: Account;
    max_toot_chars: number;
}

export interface Mention {
    url: string;
    username: string;
    acct: string;
    id: string;
}

export interface Notification {
    id: string;
    type: 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll';
    created_at: string;
    account: Account;
    status?: Status;
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
    card: Card;
    poll: Poll;    

    pleroma: PleromaStatusInfo;
}

export interface PleromaStatusInfo {
    conversation_id: number;
    local: boolean;
}

export interface Tag {
    name: string;
    url: string;
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
    options: PollOption[];
    voted: boolean;
}

export interface PollOption {
    title: string;
    votes_count: number;
}