import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { faPlay, faExpand, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faFileAlt } from "@fortawesome/free-regular-svg-icons";

import { Card } from '../../../../services/models/mastodon.interfaces';
import { NavigationService } from '../../../../services/navigation.service';
import { OpenMediaEvent } from '../../../../models/common.model';


@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
    faPlay = faPlay;
    faExpand = faExpand;
    faFileAlt = faFileAlt;
    faExternalLinkAlt = faExternalLinkAlt;

    @Input() card: Card;
    @ViewChild('video') myVideo: ElementRef;

    host: string;
    html: SafeHtml;
    showHtml: boolean;

    constructor(
        private readonly navigationService: NavigationService,
        private readonly sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.host = this.card.url.replace('https://', '').replace('http://', '').split('/')[0];
    }

    private sanitize(card: Card): SafeHtml{
        if(!card.html) return null;     

        let html = card.html.replace(`width="${card.width}"`, '');
        html = html.replace(`height="${card.height}"`, '');
        html = html.replace(`<iframe `, '<iframe allow="autoplay" style="width:100%; height:100%;"');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
    
    play(): boolean {
        this.html = this.sanitize(this.card);
        this.showHtml = true;

        setTimeout(() => {
            if(this.myVideo.nativeElement.childNodes[0].src.includes('?')){
                this.myVideo.nativeElement.childNodes[0].src+='&autoplay=1&auto_play=1';
            } else {
                this.myVideo.nativeElement.childNodes[0].src+='?autoplay=1&auto_play=1';
            }
        }, 500);
        return false;
    }

    expand(): boolean {
        this.html = this.sanitize(this.card);

        const openMedia = new OpenMediaEvent(null, null, this.html);
        this.navigationService.openMedia(openMedia);

        return false;
    }
}
