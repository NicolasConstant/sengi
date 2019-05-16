import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { faPlay, faExpand, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { faFileAlt } from "@fortawesome/free-regular-svg-icons";

import { Card } from '../../../../services/models/mastodon.interfaces';


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

    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit() {
        // console.warn('card');
        // console.warn(this.card);

        this.host = this.card.url.replace('https://', '').replace('http://', '').split('/')[0];
        this.html = this.sanitize(this.card);
    }

    private sanitize(card: Card): SafeHtml{
        if(!card.html) return null;     

        let html = card.html.replace(`width="${card.width}"`, '');
        html = html.replace(`height="${card.height}"`, '');
        html = html.replace(`<iframe `, '<iframe allow="autoplay" style="width:100%; height:100%;"');
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
    
    play(): boolean {
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

        return false;
    }
}
