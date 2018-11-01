import { Component, OnInit, Input, EventEmitter, Output, Renderer2, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-databinded-text',
    templateUrl: './databinded-text.component.html',
    styleUrls: ['./databinded-text.component.scss']
})
export class DatabindedTextComponent implements OnInit {
    private accounts: string[] = [];
    private hashtags: string[] = [];
    private links: string[] = [];

    processedText: string;

    @ViewChild('content') contentElement: ElementRef;

    @Output() accountSelected = new EventEmitter<string>();
    @Output() hashtagSelected = new EventEmitter<string>();
    @Output() textSelected = new EventEmitter();

    @Input() textIsSelectable: boolean = true;

    @Input('text')
    set text(value: string) {
        this.processedText = '';
        let linksSections = value.split('<a ');

        for (let section of linksSections) {
            if (!section.includes('href')) {
                this.processedText += section;
                continue;
            }

            if (section.includes('class="mention hashtag"') || section.includes('target="_blank">#')) {
                try {
                    this.processHashtag(section);
                }
                catch (err) {
                    console.warn('process hashtag');
                    console.warn(value);
                }

            } else if (section.includes('class="u-url mention"') || section.includes('class="mention"') || section.includes('class="mention status-link"')) {
                try {
                    this.processUser(section);
                }
                catch (err) {
                    console.warn('process mention');
                    console.warn(value);
                }
            } else {
                try {
                    this.processLink(section);
                }
                catch (err) {
                    console.warn('process link');
                    console.warn(value);
                }
            }
        }
    }

    private processHashtag(section: string) {
        let extractedLinkAndNext = section.split('</a>');
        let extractedHashtag = extractedLinkAndNext[0].split('#')[1].replace('<span>', '').replace('</span>', '');

        this.processedText += ` <a href class="${extractedHashtag}">#${extractedHashtag}</a>`;
        if (extractedLinkAndNext[1]) this.processedText += extractedLinkAndNext[1];
        this.hashtags.push(extractedHashtag);
    }

    private processUser(section: string) {
        // let mentionClass = 'class="mention"';
        // if (section.includes('class="u-url mention"'))
        //     mentionClass = 'class="u-url mention"';

        let extractedAccountAndNext = section.split('</a></span>');

        let extractedAccountName = extractedAccountAndNext[0].split('@<span>')[1].replace('<span>', '').replace('</span>', '');

        let extractedAccountLink = extractedAccountAndNext[0].split('href="https://')[1].split('"')[0].replace(' ', '').replace('@', '').split('/');

        let domain = extractedAccountLink[0];
        let username = extractedAccountLink[extractedAccountLink.length - 1];

        let extractedAccount = `@${username}@${domain}`;

        let classname = this.getClassNameForAccount(extractedAccount);
        this.processedText += ` <a href class="${classname}" title="${extractedAccount}">@${extractedAccountName}</a>`;

        if (extractedAccountAndNext[1]) this.processedText += extractedAccountAndNext[1];
        this.accounts.push(extractedAccount);
    }

    private processLink(section: string) {
        let extractedLinkAndNext = section.split('</a>')
        let extractedUrl = extractedLinkAndNext[0].split('"')[1];

        let extractedName = '';
        try {
            extractedName = extractedLinkAndNext[0].split('<span class="ellipsis">')[1].split('</span>')[0];
        } catch (err) {
            try {
                extractedName = extractedLinkAndNext[0].split('<span class="invisible">https://</span><span class="">')[1].split('</span>')[0];
            }
            catch (err) {
                extractedName = extractedLinkAndNext[0].split(' target="_blank">')[1].split('</span>')[0];
            }
        }

        this.links.push(extractedUrl);
        let classname = this.getClassNameForLink(extractedUrl);

        this.processedText += `<a href class="${classname}" title="open link">${extractedName}</a>`;
        if (extractedLinkAndNext.length > 1) this.processedText += extractedLinkAndNext[1];
    }



    constructor(private renderer: Renderer2) { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        for (const hashtag of this.hashtags) {
            let el = this.contentElement.nativeElement.querySelector(`.${hashtag}`);

            this.renderer.listen(el, 'click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();

                this.selectHashtag(hashtag);
                return false;
            });
        }

        for (const account of this.accounts) {
            let classname = this.getClassNameForAccount(account);
            let el = this.contentElement.nativeElement.querySelector(`.${classname}`);

            this.renderer.listen(el, 'click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();

                this.selectAccount(account);
                return false;
            });
        }

        for (const link of this.links) {
            let classname = this.getClassNameForLink(link);
            let el = this.contentElement.nativeElement.querySelector(`.${classname}`);
            this.renderer.listen(el, 'click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();

                window.open(link, '_blank');
                return false;
            });
        }
    }

    private getClassNameForAccount(value: string): string {
        let res = value;
        while (res.includes('.')) res = res.replace('.', '-');
        while (res.includes('@')) res = res.replace('@', '-');
        return `account-${res}`;
    }

    private getClassNameForLink(value: string): string {
        let res = value.replace(/[.,\/#?!@$%+\^&\*;:{}=\-_`~()]/g, "");
        return `link-${res}`;
    }

    private selectAccount(account: string) {
        this.accountSelected.next(account);
    }

    private selectHashtag(hashtag: string) {
        this.hashtagSelected.next(hashtag);
    }

    selectText() {
        this.textSelected.next();
    }

}
