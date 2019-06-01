import { Emoji } from "../services/models/mastodon.interfaces";
import { EmojiOne } from "./emoji-one";

export class EmojiConverter {
    private emojiOne = new EmojiOne();

    applyEmojis(emojis: Emoji[], text: string, type: EmojiTypeEnum): string {
        if (!text) return text;

        let className = "emoji-small";
        if (type === EmojiTypeEnum.medium) {
            className = "emoji-medium";
        }

        if (emojis) {
            emojis.forEach(emoji => {
                text = this.replaceAll(text, `:${emoji.shortcode}:`,  `<img class="${className}" src="${emoji.url}" title=":${
                    emoji.shortcode }:" alt=":${emoji.shortcode}:" />`)
            });
        }

        text = this.emojiOne.toImage(text, className);
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

