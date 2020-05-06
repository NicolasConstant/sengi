import { Pipe, PipeTransform } from '@angular/core';

import { EmojiConverter, EmojiTypeEnum } from '../tools/emoji.tools';
import { Account } from '../services/models/mastodon.interfaces';

@Pipe({
    name: "accountEmoji"
})
export class AccountEmojiPipe implements PipeTransform {
    private emojiConverter = new EmojiConverter();

    transform(value: Account, text?: string): any {
        try {
            let textToTransform = text;
            if (!text) {
                if (value.display_name) textToTransform = value.display_name;
                else textToTransform = value.acct.split('@')[0];
            }

            return this.emojiConverter.applyEmojis(value.emojis, textToTransform, EmojiTypeEnum.small);
        } catch (err){
            return '';
        }
    }
}
