import { Component, OnInit, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';

import { ToolsService } from '../../../services/tools.service';
import { NotificationService } from '../../../services/notification.service';
import { Emoji } from '../../../services/models/mastodon.interfaces';

@Component({
    selector: 'app-emoji-picker',
    templateUrl: './emoji-picker.component.html',
    styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent implements OnInit {
    private init = false;

    @Output('closed') public closedEvent = new EventEmitter();
    @Output('emojiSelected') public emojiSelectedEvent = new EventEmitter<string>();

    customEmojis: PickerCustomEmoji[] = [];
    loaded: boolean;

    constructor(
        private notificationService: NotificationService,
        private toolsService: ToolsService,
        private eRef: ElementRef) { }

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (!this.init) return;

        if (!this.eRef.nativeElement.contains(event.target)) {
            this.closedEvent.emit(null);
        }
    }

    ngOnInit() {
        let currentAccount = this.toolsService.getSelectedAccounts()[0];
        this.toolsService.getCustomEmojis(currentAccount)
            .then(emojis => {
                console.warn(emojis);
                this.customEmojis = emojis.map(x => this.convertEmoji(x));
            })
            .catch(err => {
                this.notificationService.notifyHttpError(err);
            })
            .then(() => {
                this.loaded = true;
            });

        setTimeout(() => {
            this.init = true;
        }, 0);
    }

    private convertEmoji(emoji: Emoji): PickerCustomEmoji {
        return new PickerCustomEmoji(emoji.shortcode, [emoji.shortcode], emoji.shortcode, [emoji.shortcode], emoji.url);
    }

    emojiSelected(select: any): boolean {
        if (select.emoji.custom) {
            this.emojiSelectedEvent.next(select.emoji.colons);
        } else {
            this.emojiSelectedEvent.next(select.emoji.native);
        }
        return false;
    }
}

class PickerCustomEmoji {
    constructor(
        public name: string,
        public shortNames: string[],
        public text: string,
        public keywords: string[],
        public imageUrl: string) {
    }
}