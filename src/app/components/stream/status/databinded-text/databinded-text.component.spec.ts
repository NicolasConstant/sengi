import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabindedTextComponent } from './databinded-text.component';
import { By } from '@angular/platform-browser';
import { isGeneratedFile } from '@angular/compiler/src/aot/util';

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
        expect(component.processedText).toContain('<a href class="hashtag-programmers">#programmers</a>');
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

    it('should parse link - dual section', () => {
        const sample = `<p>Test.<br><a href="https://peertube.fr/videos/watch/69bb6e90-ec0f-49a3-9e28-41792f4a7c5f" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="ellipsis">peertube.fr/videos/watch/69bb6</span><span class="invisible">e90-ec0f-49a3-9e28-41792f4a7c5f</span></a></p>`;

        component.text = sample;
        expect(component.processedText).toContain('<p>Test.<br><a href class="link-httpspeertubefrvideoswatch69bb6e90ec0f49a39e2841792f4a7c5f" title="open link">peertube.fr/videos/watch/69bb6</a></p>');
    });  

    it('should parse link with special character', () => {
        const sample = `<p>Magnitude: 2.5 Depth: 3.4 km<br>Details: 2018/09/27 06:50:17 34.968N 120.685W<br>Location: 10 km (6 mi) W of Guadalupe, CA<br>Map: <a href="https://www.google.com/maps/place/34°58'4%20N+120°41'6%20W/@34.968,-120.685,10z" rel="noopener" target="_blank" class="status-link" title="https://www.google.com/maps/place/34%C2%B058'4%20N+120%C2%B041'6%20W/@34.968,-120.685,10z"><span class="invisible">https://www.</span><span class="ellipsis">google.com/maps/place/34°58'4%</span><span class="invisible">20N+120°41'6%20W/@34.968,-120.685,10z</span></a><br><a href="https://mastodon.cloud/tags/earthquake" class="mention hashtag status-link" rel="noopener" target="_blank">#<span>EarthQuake</span></a> <a href="https://mastodon.cloud/tags/quake" class="mention hashtag status-link" rel="noopener" target="_blank">#<span>Quake</span></a> <a href="https://mastodon.cloud/tags/california" class="mention hashtag status-link" rel="noopener" target="_blank">#<span>California</span></a></p>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href class="link-httpswwwgooglecommapsplace3458420N12041620W3496812068510z" title="open link">google.com/maps/place/34°58\'4%</a>');
    });

    it('should parse combined hashtag, mention and link', () => {
        const hashtag = 'programmers';
        const hashtagUrl = 'https://test.social/tags/programmers';
        const mention = 'sengi_app';
        const mentionUrl = 'https://mastodon.social/@sengi_app';
        const linkUrl = 'mydomain.co/test';
        const sample = `<p>bla1 <a href="${hashtagUrl}" class="mention hashtag" rel="nofollow noopener" target="_blank">#<span>${hashtag}</span></a> bla2 <span class="h-card"><a href="${mentionUrl}" class="u-url mention" rel="nofollow noopener" target="_blank">@<span>${mention}</span></a></span> bla3 <a href="https://${linkUrl}" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="">${linkUrl}</span><span class="invisible"></span></a> bla4</p>`;
        component.text = sample;
        expect(component.processedText).toContain('<a href class="hashtag-programmers">#programmers</a>');
        expect(component.processedText).toContain('<a href class="account--sengi_app-mastodon-social" title="@sengi_app@mastodon.social">@sengi_app</a>');
        expect(component.processedText).toContain('<a href class="link-httpsmydomaincotest" title="open link">mydomain.co/test</a>');
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
        expect(component.processedText).toContain('bla3');
        expect(component.processedText).toContain('bla4');
    });

    it('should parse link - GNU social in Mastodon', () => {
        const sample = `bla1 <a href="https://www.lemonde.fr/planete.html?xtor=RSS-3208" rel="nofollow noopener" class="" target="_blank">https://social.bitcast.info/url/819438</a>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href class="link-httpswwwlemondefrplanetehtmlxtorRSS3208" title="open link">https://social.bitcast.info/url/819438</a>');
        expect(component.processedText).toContain('bla1');
    });

    it('should parse mention - Pleroma in Mastodon', () => {
        const sample = `<div>bla1 <br> @<a href="https://instance.club/user/1" class="h-card mention status-link" rel="noopener" target="_blank" title="https://instance.club/user/1">user</a>&nbsp;</div>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href class="account--user-instance-club" title="@user@instance.club">@user</a>');
        expect(component.processedText).toContain('bla1');     
    })

    it('should parse mention - Pleroma in Mastodon - 2', () => {
        const sample = `<div><span><a class="mention status-link" href="https://pleroma.site/users/kaniini" rel="noopener" target="_blank" title="kaniini@pleroma.site">@<span>kaniini</span></a></span> <span><a class="mention status-link" href="https://mastodon.social/@Gargron" rel="noopener" target="_blank" title="Gargron@mastodon.social">@<span>Gargron</span></a></span> bla1?</div>`;

        component.text = sample;
        expect(component.processedText).toContain('<div><span><a href class="account--kaniini-pleroma-site" title="@kaniini@pleroma.site">@kaniini</a> <span><a href class="account--Gargron-mastodon-social" title="@Gargron@mastodon.social">@Gargron</a> bla1?</div>');
    });       
});
