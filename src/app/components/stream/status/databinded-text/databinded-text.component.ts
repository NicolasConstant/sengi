import { Component, OnInit, Input, EventEmitter, Output, Renderer2, ViewChild, ElementRef } from '@angular/core';

import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'app-databinded-text',
    templateUrl: './databinded-text.component.html',
    styleUrls: ['./databinded-text.component.scss']
})
export class DatabindedTextComponent implements OnInit {
    faAngleDown = faAngleDown;

    private accounts: string[] = [];
    private hashtags: string[] = [];
    private links: string[] = [];

    processedText: string;
    isCollapsed: boolean = false;

    @ViewChild('content') contentElement: ElementRef;

    @Output() accountSelected = new EventEmitter<string>();
    @Output() hashtagSelected = new EventEmitter<string>();
    @Output() textSelected = new EventEmitter();

    @Input() textIsSelectable: boolean = true;
    @Input() selected: boolean;

    @Input('text')
    set text(value: string) {
        // console.log(value);

        let parser = new DOMParser();
        var dom = parser.parseFromString(value, 'text/html')
        this.isCollapsed = [...dom.body.textContent].length > 600;

        this.processedText = '';

        do {
            value = value.replace('@<span class="">', '<span class="">'); //Friendica sanitization
        } while (value.includes('@<span class="">'));

        do {
            value = value.replace('class="mention" rel="nofollow noopener" target="_blank">@', 'class="mention" rel="nofollow noopener" target="_blank">'); //Misskey sanitization
        } while (value.includes('class="mention" rel="nofollow noopener" target="_blank">@'));

        do {
            value = value.replace('@<span class="h-card">', '<span class="h-card">'); //Zap sanitization
        } while (value.includes('@<span class="h-card">'));

        let linksSections = value.split('<a ');

        for (let section of linksSections) {
            if (!section.includes('href')) {
                this.processedText += section;
                continue;
            }

            if (section.includes('class="mention hashtag"') || section.includes('class="hashtag"') || section.includes('target="_blank">#') || section.includes('rel="tag">')) {
                try {
                    this.processHashtag(section);
                }
                catch (err) {
                    console.error('error processing hashtag');
                    console.error(value);
                }

            } else if (section.includes('class="u-url mention"') || section.includes('class="mention"') || section.includes('class="mention status-link"') || section.includes('class="h-card mention')) {
                try {
                    this.processUser(section);
                }
                catch (err) {
                    console.error('error processing mention');
                    console.error(value);
                }
            } else {
                try {
                    this.processLink(section);
                    //this.processedText += `<a ${section}`;
                }
                catch (err) {
                    console.error('error processing link');
                    console.error(value);
                }
            }
        }
    }

    expand(): boolean {
        this.isCollapsed = false;
        return false;
    }

    private processHashtag(section: string) {
        let extractedLinkAndNext = section.split('</a>');
        let extractedHashtag = extractedLinkAndNext[0].split('#')[1].replace('<span class="article-type">', '').replace('<span>', '').replace('</span>', '');
        let extractedUrl = extractedLinkAndNext[0].split('href="')[1].split('"')[0];

        let classname = this.getClassNameForHastag(extractedHashtag);
        this.processedText += ` <a href="${extractedUrl}" class="${classname}" title="#${extractedHashtag}" target="_blank" rel="noopener noreferrer">#${extractedHashtag}</a>`;
        if (extractedLinkAndNext[1]) this.processedText += extractedLinkAndNext[1];
        this.hashtags.push(extractedHashtag);
    }

    private processUser(section: string) {
        let extractedAccountAndNext: string[];
        let extractedAccountName: string;

        if (section.includes('<span class="mention">')) { //Friendica
            extractedAccountAndNext = section.split('</a>');
            extractedAccountName = extractedAccountAndNext[0].split('<span class="mention">')[1].split('</span>')[0];
        } else if (section.includes('>@<span class="article-type">')) { //Remote status
            extractedAccountAndNext = section.split('</a></span>');
            extractedAccountName = extractedAccountAndNext[0].split('@<span class="article-type">')[1].replace('<span>', '').replace('</span>', '');
        } else if (section.includes('class="u-url mention" rel="nofollow noopener noreferrer" target="_blank">@') && !section.includes('target="_blank">@<')) { //Misskey
            extractedAccountAndNext = section.split('</a>');
            extractedAccountName = extractedAccountAndNext[0].split('class="u-url mention" rel="nofollow noopener noreferrer" target="_blank">@')[1];

            if (extractedAccountName.includes('@'))
                extractedAccountName = extractedAccountName.split('@')[0];
        } else if (section.includes(' class="u-url mention">@') && !section.includes(' class="u-url mention">@<')) { //Misskey in pleroma
            extractedAccountAndNext = section.split('</a>');
            extractedAccountName = extractedAccountAndNext[0].split(' class="u-url mention">@')[1];

            if (extractedAccountName.includes('@'))
                extractedAccountName = extractedAccountName.split('@')[0];

        } else if (!section.includes('@<span>')) { //GNU social
            extractedAccountAndNext = section.split('</a>');
            extractedAccountName = extractedAccountAndNext[0].split('>')[1];
        } else {
            extractedAccountAndNext = section.split('</a></span>');
            extractedAccountName = extractedAccountAndNext[0].split('@<span>')[1].replace('<span>', '').replace('</span>', '');
        }

        let extractedAccountLink = extractedAccountAndNext[0].split('href="https://')[1].split('"')[0].replace(' ', '').replace('@', '').split('/');

        let domain = extractedAccountLink[0];
        //let username = extractedAccountLink[extractedAccountLink.length - 1];

        let extractedAccount = `@${extractedAccountName}@${domain}`;
        let extractedUrl = section.split('href="')[1].split('"')[0];

        let classname = this.getClassNameForAccount(extractedAccount);
        this.processedText += `<a href="${extractedUrl}" class="${classname}" title="${extractedAccount}" target="_blank" rel="noopener noreferrer">@${extractedAccountName}</a>`;

        if (extractedAccountAndNext[1])
            this.processedText += extractedAccountAndNext[1];

        //GNU Social clean up
        if (this.processedText.includes('@<a'))
            this.processedText = this.processedText.replace('@<a', '<a');

        this.accounts.push(extractedAccount);
    }

    private processLink(section: string) {
        if (!section.includes('</a>')) {
            this.processedText += section;
            return;
        }

        let extractedLinkAndNext = section.split('</a>')
        let extractedUrl = extractedLinkAndNext[0].split('"')[1];

        let extractedName = '';      

        if(extractedLinkAndNext[0].includes('<span class="article-type">')){
            extractedName = extractedLinkAndNext[0].split('<span class="article-type">')[2].split('</span>')[0];
        } else {
            try {
                extractedName = extractedLinkAndNext[0].split('<span class="ellipsis">')[1].split('</span>')[0];
            } catch (err) {
                try {
                    extractedName = extractedLinkAndNext[0].split(`<span class="">`)[1].split('</span>')[0];
                }
                catch (err) {
                    try {
                        extractedName = extractedLinkAndNext[0].split(' target="_blank">')[1].split('</span>')[0];
                    } catch (err) { // Pleroma
                        try {
                            extractedName = extractedLinkAndNext[0].split('</span><span>')[1].split('</span>')[0];
                        } catch (err) {
                            extractedName = extractedLinkAndNext[0].split('">')[1];
                        }
                    }
                }
            }
        }
        
        this.links.push(extractedUrl);
        let classname = this.getClassNameForLink(extractedUrl);

        let sanitizedLink = this.sanitizeLink(extractedUrl);

        this.processedText += `<a href="${sanitizedLink}" class="${classname}" title="open link" target="_blank" rel="noopener noreferrer">${extractedName}</a>`;
        if (extractedLinkAndNext.length > 1) this.processedText += extractedLinkAndNext[1];
    }



    constructor(private renderer: Renderer2) { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        for (const hashtag of this.hashtags) {
            let classname = this.getClassNameForHastag(hashtag);
            let els = <Element[]>this.contentElement.nativeElement.querySelectorAll(`.${classname}`);

            for (const el of els) {
                this.renderer.listen(el, 'click', (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    this.selectHashtag(hashtag);
                    return false;
                });
            }
        }

        for (const account of this.accounts) {
            let classname = this.getClassNameForAccount(account);
            let els = this.contentElement.nativeElement.querySelectorAll(`.${classname}`);

            for (const el of els) {
                this.renderer.listen(el, 'click', (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();

                    this.selectAccount(account);
                    return false;
                });
            }
        }

        for (const link of this.links) {
            let classname = this.getClassNameForLink(link);
            let els = this.contentElement.nativeElement.querySelectorAll(`.${classname}`);

            let sanitizedLink = this.sanitizeLink(link);

            for (const el of els) {
                this.renderer.listen(el, 'click', (event) => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    window.open(sanitizedLink, '_blank', 'noopener');
                    return false;
                });

                // this.renderer.listen(el, 'mouseup', (event) => {
                //     if (event.which === 2) {
                //         event.preventDefault();
                //         event.stopImmediatePropagation();
                //         window.open(sanitizedLink, '_blank', 'noopener');
                //         return false;
                //     }
                // });
            }
        }
    }

    private sanitizeLink(link: string): string {
        let res = link.replace(/&amp;/g, '&');
        return res;
    }

    private getClassNameForHastag(value: string): string {
        let res = value.replace(/[.,\/#?!@$%+\^&\*;:{}=\-_`~()]/g, "");
        return `hashtag-${res}`;
    }

    private getClassNameForAccount(value: string): string {
        let res = value;
        while (res.includes('.')) res = res.replace('.', '-');
        while (res.includes('@')) res = res.replace('@', '-');
        return `account-${res}`;
    }

    private getClassNameForLink(value: string): string {
        let res = value.replace(/[.,\/#?!@°$%+\'\^&\*;:{}=\-_`~()]/g, "");
        return `link-${res}`;
    }

    private selectAccount(account: string) {
        this.accountSelected.next(account);
    }

    private selectHashtag(hashtag: string) {
        this.hashtagSelected.next(hashtag);
    }

    selectText(event) {
        if (event.view.getSelection().toString().length === 0) {
            this.textSelected.next();
        }
    }

}
