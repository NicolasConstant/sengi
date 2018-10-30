import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabindedTextComponent } from './databinded-text.component';
import { By } from '@angular/platform-browser';

describe('DatabindedTextComponent', () => {
    let component: DatabindedTextComponent;
    let fixture: ComponentFixture<DatabindedTextComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DatabindedTextComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DatabindedTextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should parse text', () => {
        const sample = '<p>sample text<p>';
        component.text = sample;
        // fixture.detectChanges();
        expect(component.processedText).toContain(sample);
    });

    it('should parse hashtag', () => {
        const hashtag = 'programmers';
        const url = 'https://test.social/tags/programmers';
        const sample = `<p>bla1 <a href="${url}" class="mention hashtag" rel="nofollow noopener" target="_blank">#<span>${hashtag}</span></a> bla2</p>`;
        component.text = sample;
        expect(component.processedText).toContain('<a href class="programmers">#programmers</a>');
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse mention', () => {
        const mention = 'sengi_app';
        const url = 'https://mastodon.social/@sengi_app';
        const sample = `<p>bla1 <span class="h-card"><a href="${url}" class="u-url mention" rel="nofollow noopener" target="_blank">@<span>${mention}</span></a></span> bla2</p>`;
        component.text = sample;
        expect(component.processedText).toContain('<a href class="account--sengi_app-mastodon-social" title="@sengi_app@mastodon.social">@sengi_app</a>');
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse link', () => {
        const url = 'mydomain.co/test';
        const sample = `<p>bla1 <a href="https://${url}" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="">${url}</span><span class="invisible"></span></a> bla2</p>`;
        component.text = sample;
        expect(component.processedText).toContain('<a href class="link-httpsmydomaincotest" title="open link">mydomain.co/test</a>');
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse combined hashtag, mention and link', () => {
        const hashtag = 'programmers';
        const hashtagUrl = 'https://test.social/tags/programmers';
        const mention = 'sengi_app';
        const mentionUrl = 'https://mastodon.social/@sengi_app';
        const linkUrl = 'mydomain.co/test';
        const sample = `<p>bla1 <a href="${hashtagUrl}" class="mention hashtag" rel="nofollow noopener" target="_blank">#<span>${hashtag}</span></a> bla2 <span class="h-card"><a href="${mentionUrl}" class="u-url mention" rel="nofollow noopener" target="_blank">@<span>${mention}</span></a></span> bla3 <a href="https://${linkUrl}" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="">${linkUrl}</span><span class="invisible"></span></a> bla4</p>`;
        component.text = sample;
        expect(component.processedText).toContain('<a href class="programmers">#programmers</a>');
        expect(component.processedText).toContain('<a href class="account--sengi_app-mastodon-social" title="@sengi_app@mastodon.social">@sengi_app</a>');
        expect(component.processedText).toContain('<a href class="link-httpsmydomaincotest" title="open link">mydomain.co/test</a>');
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
        expect(component.processedText).toContain('bla3');
        expect(component.processedText).toContain('bla4');
    });

    it('should parse link - GNU social', () => {
        const sample = `bla1 <a href="https://www.lemonde.fr/planete.html?xtor=RSS-3208" rel="nofollow noopener" class="" target="_blank">https://social.bitcast.info/url/819438</a>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href class="link-httpswwwlemondefrplanetehtmlxtorRSS3208" title="open link">https://social.bitcast.info/url/819438</a>');
        expect(component.processedText).toContain('bla1');
    });
  
});
