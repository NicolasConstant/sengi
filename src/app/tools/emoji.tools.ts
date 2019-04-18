import { Emoji } from '../services/models/mastodon.interfaces';
import * as EmojiOne from 'emojione';

export class EmojiConverter {
    applyEmojis(emojis: Emoji[], text: string, type: EmojiTypeEnum, url: string): string {
        //const instanceUrl = 'https://' + url.split('https://')[1].split('/')[0];

        let className = 'emoji-small';
        if (type === EmojiTypeEnum.medium) {
            className = 'emoji-medium';
        }

        emojis.forEach(emoji => {
            text = text.replace(`:${emoji.shortcode}:`, `<img class="${className}" src="${emoji.url}" title=":${emoji.shortcode}:" alt=":${emoji.shortcode}:" />`);
        });

        text = EmojiOne.toImage(text);

        while (text.includes('class="emojione"')) {
            text = text.replace('class="emojione"', `class="emojione ${className}"`);
        }

        //FIXME: clean up this mess...
        // while (text.includes('https://cdn.jsdelivr.net/emojione/assets/4.5/png/32/')) {
        //     text = text.replace('https://cdn.jsdelivr.net/emojione/assets/4.5/png/32/', instanceUrl + '/emoji/');
        //     text = text.replace('.png', '.svg');
        // }

        while (text.includes('https://cdn.jsdelivr.net/emojione/assets/4.5/png/32/')) {
            text = text.replace('https://cdn.jsdelivr.net/emojione/assets/4.5/png/32/', 'assets/emoji/');
            text = text.replace('.png', '.svg');
        }

        return text;
    }
}

export enum EmojiTypeEnum {
    small,
    medium
}