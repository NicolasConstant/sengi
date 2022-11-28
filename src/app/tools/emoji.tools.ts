import { Emoji } from "../services/models/mastodon.interfaces";
// import { EmojiOne } from "./emoji-one";
import * as EmojiOne from 'emojione';

export class EmojiConverter {
    // private emojiOne = new EmojiOne();

    applyEmojis(emojis: Emoji[], text: string, type: EmojiTypeEnum): string {
        if (!text) return text;

        let className = "emoji-small";
        if (type === EmojiTypeEnum.medium) {
            className = "emoji-medium";
        }

        if (emojis) {
            emojis.forEach(emoji => {
                try {
                    text = this.replaceAll(text, `:${emoji.shortcode}:`, `<img class="${className}" src="${emoji.url}" title=":${
                        emoji.shortcode}:" alt=":${emoji.shortcode}:" />`);
                } catch (err) {}
            });
        }

        text = this.applyEmojiOne(className, text);

        // try {
        //     text = this.emojiOne.toImage(text, className);
        // } catch (err) {}
        return text;
    }

    private applyEmojiOne(className: string, text: string): string{
        text = EmojiOne.shortnameToImage(text);

        while (text.includes('class="emojione"')) {
          text = text.replace('class="emojione"', `class="emojione ${className}"`);
        }

        while (
          text.includes("https://cdn.jsdelivr.net/emojione/assets/4.5/png/32/")
        ) {
          text = text.replace(
            "https://cdn.jsdelivr.net/emojione/assets/4.5/png/32/",
            "assets/emoji/72x72/"
          );
          // text = text.replace('.png', '.svg');
        }

        return text;
    }

    private replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}

export enum EmojiTypeEnum {
    small,
    medium
}

