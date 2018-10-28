import { Component, OnInit, Input, EventEmitter, Output, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
    selector: 'app-databinded-text',
    templateUrl: './databinded-text.component.html',
    styleUrls: ['./databinded-text.component.scss']
})
export class DatabindedTextComponent implements OnInit {
    private accounts: string[] = [];
    private hashtags: string[] = [];

    processedText: string;

    @ViewChild('content') contentElement: ElementRef;

    @Output() accountSelected = new EventEmitter<string>();
    @Output() hashtagSelected = new EventEmitter<string>();
    @Output() textSelected = new EventEmitter();

    @Input('text')
    set text(value: string) {
        this.processedText = '';

        let linksSections = value.split('<a ');

        for (let section of linksSections) {
            if (!section.includes('href')) {
                this.processedText += section;
                continue;
            }

            if (section.includes('class="mention hashtag"')) {
                let extractedLinkAndNext = section.split('</a>');
                let extractedHashtag = extractedLinkAndNext[0].split('#')[1].replace('<span>', '').replace('</span>', '');

                this.processedText += ` <a href class="${extractedHashtag}">#${extractedHashtag}</a>`;
                if (extractedLinkAndNext[1]) this.processedText += extractedLinkAndNext[1];
                this.hashtags.push(extractedHashtag);

            } else if (section.includes('class="u-url mention"')) {
                let extractedAccountAndNext = section.split('</a></span>');

                let extractedAccountName = extractedAccountAndNext[0].split('@<span>')[1].replace('<span>', '').replace('</span>', '');
                let extractedAccountLink = extractedAccountAndNext[0].split('" class="u-url mention"')[0].replace('href="https://', '').replace(' ', '').replace('@', '').split('/');
                let extractedAccount = `@${extractedAccountLink[1]}@${extractedAccountLink[0]}`;

                let classname = this.getClassNameFromAccount(extractedAccount);
                this.processedText += ` <a href class="${classname}" title="${extractedAccount}">@${extractedAccountName}</a>`;

                if (extractedAccountAndNext[1]) this.processedText += extractedAccountAndNext[1];
                this.accounts.push(extractedAccount);
            } else {
                this.processedText += `<a ${section}`;
            }
        }
    }



    constructor(private renderer: Renderer2) { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        for (const hashtag of this.hashtags) {
            let el = this.contentElement.nativeElement.querySelector(`.${hashtag}`);

            this.renderer.listen(el, 'click', (el2) => {
                this.selectHashtag(hashtag);
                return false;
            });
        }

        for (const account of this.accounts) {
            let classname = this.getClassNameFromAccount(account);
            let el = this.contentElement.nativeElement.querySelector(`.${classname}`);

            this.renderer.listen(el, 'click', (el2) => {
                this.selectAccount(account);
                return false;
            });
        }



        // let el = this.contentElement.nativeElement.querySelector('.test');
        // console.log(this.contentElement.nativeElement);
        // console.log(el);
        // if (el)
        //     this.renderer.listen(el, 'click', (el2) => {
        //         console.log(el2);
        //         console.warn('YOOOOO');
        //         return false;
        //     });
    }

    private getClassNameFromAccount(value: string) {
        return value.replace('.', '-').replace('@', '-').replace('@', '-');
    }

    private selectAccount(account: string) {
        console.warn(`select ${account}`);
        this.accountSelected.next(account);
    }

    private selectHashtag(hashtag: string) {
        console.warn(`select ${hashtag}`);
        this.hashtagSelected.next(hashtag);
    }

    private selectText() {
        this.textSelected.next();
    }

}
