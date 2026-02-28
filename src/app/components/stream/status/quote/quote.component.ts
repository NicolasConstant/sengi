import { Component, OnInit, Input, Output, EventEmitter, ApplicationRef } from '@angular/core';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

import { Status, Account, Quote, ShallowQuote } from '../../../../services/models/mastodon.interfaces';
import { EmojiConverter, EmojiTypeEnum } from '../../../../tools/emoji.tools';
import { OpenThreadEvent, ToolsService } from '../../../../services/tools.service';
import { SettingsService } from '../../../../services/settings.service';
import { AccountInfo } from '../../../../states/accounts.state';
import { MastodonWrapperService } from '../../../../services/mastodon-wrapper.service';
import { StatusWrapper } from '../../../../models/common.model';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss']
})
export class QuoteComponent implements OnInit {
  private emojiConverter = new EmojiConverter();
  faCircle = faCircle;

  displayStatus: Status;
  displayStatusWrapper: StatusWrapper;
  quoteState: 'pending' | 'accepted' | 'rejected' | 'revoked' | 'deleted' | 'unauthorized' | 'blocked_account' | 'blocked_domain' | 'muted_account';
  error: string;

  private quote: Quote;
  private shallowQuote: ShallowQuote;

  @Output() browseAccountEvent = new EventEmitter<string>();
  @Output() browseHashtagEvent = new EventEmitter<string>();
  @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

  @Input() accountInfo: AccountInfo;

  @Input('quote')
  set setQuote(value: Quote | ShallowQuote) {

    this.quoteState = value.state;
    //this.quoteState = "revoked";

    let quoteValue = <Quote>value;

    if (quoteValue.quoted_status) { // Quote

      this.quote = quoteValue;
      this.displayStatus = quoteValue.quoted_status;

      if (!this.displayStatus.account.display_name) {
        this.displayStatus.account.display_name = this.displayStatus.account.username;
      }

      const statusContent = this.emojiConverter.applyEmojis(this.displayStatus.emojis, this.displayStatus.content, EmojiTypeEnum.medium);
      this.statusContent = this.ensureMentionAreDisplayed(statusContent);

    } else { // ShallowQuote
      this.shallowQuote = <ShallowQuote>value;
      this.mastodonService.getStatus(this.accountInfo, this.shallowQuote.quoted_status_id)
        .then(status => {
          this.displayStatus = status;
          this.appRef.tick();
        })
        .catch(err => {
          console.error(err);
          this.error = "Error retrieving status.";
          this.appRef.tick();
        });
    }

    this.displayStatusWrapper = new StatusWrapper(this.displayStatus, this.accountInfo, false, false);
  }

  statusContent: string;
  private freezeAvatarEnabled: boolean;

  constructor(
    private appRef: ApplicationRef,
    private readonly settingsService: SettingsService,
    private readonly toolsService: ToolsService,
    private readonly mastodonService: MastodonWrapperService) {
    this.freezeAvatarEnabled = this.settingsService.getSettings().enableFreezeAvatar;
  }

  ngOnInit() {
  }

  // TODO: refactorise this
  private ensureMentionAreDisplayed(data: string): string {
    const mentions = this.displayStatus.mentions;
    if (!mentions || mentions.length === 0) {
      return data;
    }

    let textMentions = '';
    for (const m of mentions) {
      if (!data.includes(m.url)) {
        textMentions += `<span class="h-card">
                <a class="u-url mention" data-user="${m.id}" href="${m.url}" rel="ugc">@
                    <span>${m.username}</span>
                </a>
            </span> `;
      }
    }
    if (textMentions !== '') {
      data = textMentions + data;
    }
    return data;
  }

  getReadableStatus(state: 'pending' | 'accepted' | 'rejected' | 'revoked' | 'deleted' | 'unauthorized' | 'blocked_account' | 'blocked_domain' | 'muted_account'): string {
    switch (state) {
      case "pending": return "Waiting for author authorization."
      case "rejected": return "Author rejected quote, can't be displayed."
      case "revoked": return "Author revoked quote, can't be displayed.";
      case "deleted": return "Post deleted.";
      case "unauthorized": return "Not authorized.";
      case "blocked_account": return "Blocked account.";
      case "blocked_domain": return "Blocked domain.";
      case "muted_account": return "Muted account.";
    }
    return "";
  }

  accountSelected(accountName: string): void {
    this.browseAccountEvent.next(accountName);
  }

  hashtagSelected(hashtag: string): void {
    this.browseHashtagEvent.next(hashtag);
  }

  textSelected(): boolean {
    let status = this.displayStatus;
    const accountInfo = this.accountInfo;

    if (status.reblog) {
      status = status.reblog;
    }

    const openThread = new OpenThreadEvent(status, accountInfo);
    this.browseThreadEvent.next(openThread);
    return false;
  }

  getAvatar(acc: Account): string {
    if (this.freezeAvatarEnabled) {
      return acc.avatar_static;
    } else {
      return acc.avatar;
    }
  }

  openAccount(account: Account): boolean {
    let accountName = this.toolsService.getAccountFullHandle(account);
    this.browseAccountEvent.emit(accountName);
    return false;
  }

}
