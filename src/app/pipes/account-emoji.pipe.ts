import { Pipe, PipeTransform } from '@angular/core';

import { EmojiConverter, EmojiTypeEnum } from '../tools/emoji.tools';
import { Account } from '../services/models/mastodon.interfaces';

@Pipe({
  name: "accountEmoji"
})
export class AccountEmojiPipe implements PipeTransform {
  private emojiConverter = new EmojiConverter();

  transform(value: Account, args?: any): any {
    return this.emojiConverter.applyEmojis(value.emojis, value.display_name, EmojiTypeEnum.small)
  }
}
