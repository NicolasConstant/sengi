import { Pipe, PipeTransform } from '@angular/core';

import { EmojiConverter, EmojiTypeEnum } from '../tools/emoji.tools';
import { Account } from '../services/models/mastodon.interfaces';

@Pipe({
  name: "accountEmoji"
})
export class AccountEmojiPipe implements PipeTransform {
  private emojiConverter = new EmojiConverter();

  transform(value: Account, text?: string): any {

    let textToTransform = text;
    if(!text){
      textToTransform = value.display_name;
    } 

    return this.emojiConverter.applyEmojis(value.emojis, textToTransform, EmojiTypeEnum.small)
  }
}
