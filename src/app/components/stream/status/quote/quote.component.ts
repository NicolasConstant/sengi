import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Status } from '../../../../services/models/mastodon.interfaces';
import { EmojiConverter, EmojiTypeEnum } from '../../../../tools/emoji.tools';
import { OpenThreadEvent } from '../../../../services/tools.service';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss']
})
export class QuoteComponent implements OnInit {
  private emojiConverter = new EmojiConverter();

  private displayStatus: Status;

  @Output() browseAccountEvent = new EventEmitter<string>();
  @Output() browseHashtagEvent = new EventEmitter<string>();
  @Output() browseThreadEvent = new EventEmitter<OpenThreadEvent>();

  @Input('status')
  set status(value: Status){
    this.displayStatus = value;

    let statusContent = this.emojiConverter.applyEmojis(this.displayStatus.emojis, this.displayStatus.content, EmojiTypeEnum.medium);
    this.statusContent = this.ensureMentionAreDisplayed(statusContent);

    console.warn('statucontent');
    console.warn(this.statusContent);
    console.warn(value);
  }
  get status(): Status {
    return this.displayStatus;
  }

  statusContent: string;

  constructor() {
  
   }

  ngOnInit() {
  }

  //TODO: refactorise this
  private ensureMentionAreDisplayed(data: string): string {
    const mentions = this.status.mentions;
    if (!mentions || mentions.length === 0) return data;

    let textMentions = '';
    for (const m of mentions) {
        if (!data.includes(m.url)) {
            textMentions += `<span class="h-card"><a class="u-url mention" data-user="${m.id}" href="${m.url}" rel="ugc">@<span>${m.username}</span></a></span> `
        }
    }
    if (textMentions !== '') {
        data = textMentions + data;
    }
    return data;
  }

  accountSelected(accountName: string): void {
          this.browseAccountEvent.next(accountName);
      }
  
      hashtagSelected(hashtag: string): void {
          this.browseHashtagEvent.next(hashtag);
      }
  
      textSelected(): boolean {
          // if (this.isSelected) return false;
  
          // const status = this._statusWrapper.status;
          // const accountInfo = this._statusWrapper.provider;
  
          // let openThread: OpenThreadEvent;
          // if (status.reblog) {
          //     openThread = new OpenThreadEvent(status.reblog, accountInfo);
          // } else {
          //     openThread = new OpenThreadEvent(status, accountInfo);
          // }
  
          // this.browseThreadEvent.next(openThread);
          return false;
      }

}
