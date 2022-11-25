import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabindedTextComponent } from './databinded-text.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DatabindedTextComponent', () => {
    let component: DatabindedTextComponent;
    let fixture: ComponentFixture<DatabindedTextComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DatabindedTextComponent],
            schemas:  [CUSTOM_ELEMENTS_SCHEMA]
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

    it('should parse href text', () => {
        const sample = '<p>href<p>';
        component.text = sample;
        expect(component.processedText).toBe(sample);
    });

    it('should parse hashtag', () => {
        const hashtag = 'programmers';
        const url = 'https://test.social/tags/programmers';
        const sample = `<p>bla1 <a href="${url}" class="mention hashtag" rel="nofollow noopener" target="_blank">#<span>${hashtag}</span></a> bla2</p>`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="${url}" class="hashtag-programmers" title="#programmers" target="_blank" rel="noopener noreferrer">#programmers</a>`);
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse hashtag - Hometown', () => {
        const hashtag = 'MicroFiction';
        const url = 'https://mastodon.social/tags/MicroFiction';
        const sample = `<p>"bla1"<br><a href="${url}" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span class="article-type">${hashtag}</span></a> bla2</p>`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="${url}" class="hashtag-${hashtag}" title="#${hashtag}" target="_blank" rel="noopener noreferrer">#${hashtag}</a>`);
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse hashtag - Pleroma 2.0.2', () => {
        const sample = `Blabla <a class="hashtag" data-tag="covid19" href="https://url.com/tag/covid19">#covid19</a> Blibli`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="https://url.com/tag/covid19" class="hashtag-covid19" title="#covid19" target="_blank" rel="noopener noreferrer">#covid19</a>`);
        expect(component.processedText).toContain('Blabla');
        expect(component.processedText).toContain('Blibli');
    });

    it('should parse mention', () => {
        const mention = 'sengi_app';
        const url = 'https://mastodon.social/@sengi_app';
        const sample = `<p>bla1 <span class="h-card"><a href="${url}" class="u-url mention" rel="nofollow noopener" target="_blank">@<span>${mention}</span></a></span> bla2</p>`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="${url}" class="account--sengi_app-mastodon-social" title="@sengi_app@mastodon.social" target="_blank" rel="noopener noreferrer">@sengi_app</a>`);
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse remote mention', () => {
        const sample = `<p><span class="article-type"><a href="https://domain.name/@username" class="u-url mention" rel="nofollow noopener noreferrer" target="_blank">@<span class="article-type">username</span></a></span> <br>Yes, indeed.</p>`;

        component.text = sample;
        expect(component.processedText).toBe('<p><span class="article-type"><a href="https://domain.name/@username" class="account--username-domain-name" title="@username@domain.name" target="_blank" rel="noopener noreferrer">@username</a> <br>Yes, indeed.</p>');
    });

    it('should parse link', () => {
        const url = 'mydomain.co/test';
        const sample = `<p>bla1 <a href="https://${url}" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="">${url}</span><span class="invisible"></span></a> bla2</p>`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="https://${url}" class="link-httpsmydomaincotest" title="open link" target="_blank" rel="noopener noreferrer">mydomain.co/test</a>`);
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse link - Hometown', () => {
        const url = 'bbs.archlinux.org/test';
        const sample = `<p>bla1 <a href="https://${url}" rel="nofollow noopener noreferrer" target="_blank"><span class="article-type">https://</span><span class="article-type">${url}</span><span class="article-type">p?id=264086&amp;action=new</span></a> bla2`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="https://${url}" class="link-httpsbbsarchlinuxorgtest" title="open link" target="_blank" rel="noopener noreferrer">${url}</a>`);
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
    });

    it('should parse https://www. link', () => {
        const url = 'bbc.com/news/magazine-34901704';
        const sample = `<p>The rise of"<br><a href="https:www//${url}" rel="nofollow noopener" target="_blank"><span class="invisible">https://www.</span><span class="">${url}</span><span class="invisible"></span></a></p>`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="https:www//${url}" class="link-httpswwwbbccomnewsmagazine34901704" title="open link" target="_blank" rel="noopener noreferrer">bbc.com/news/magazine-34901704</a></p>`);
    });

    it('should parse link - dual section', () => {
        const sample = `<p>Test.<br><a href="https://peertube.fr/videos/watch/69bb6e90-ec0f-49a3-9e28-41792f4a7c5f" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="ellipsis">peertube.fr/videos/watch/69bb6</span><span class="invisible">e90-ec0f-49a3-9e28-41792f4a7c5f</span></a></p>`;

        component.text = sample;
        expect(component.processedText).toContain('<p>Test.<br><a href="https://peertube.fr/videos/watch/69bb6e90-ec0f-49a3-9e28-41792f4a7c5f" class="link-httpspeertubefrvideoswatch69bb6e90ec0f49a39e2841792f4a7c5f" title="open link" target="_blank" rel="noopener noreferrer">peertube.fr/videos/watch/69bb6</a></p>');
    });  

    it('should parse link with special character', () => {
        const sample = `<p>Magnitude: 2.5 Depth: 3.4 km<br>Details: 2018/09/27 06:50:17 34.968N 120.685W<br>Location: 10 km (6 mi) W of Guadalupe, CA<br>Map: <a href="https://www.google.com/maps/place/34°58'4%20N+120°41'6%20W/@34.968,-120.685,10z" rel="noopener" target="_blank" class="status-link" title="https://www.google.com/maps/place/34%C2%B058'4%20N+120%C2%B041'6%20W/@34.968,-120.685,10z"><span class="invisible">https://www.</span><span class="ellipsis">google.com/maps/place/34°58'4%</span><span class="invisible">20N+120°41'6%20W/@34.968,-120.685,10z</span></a><br><a href="https://mastodon.cloud/tags/earthquake" class="mention hashtag status-link" rel="noopener" target="_blank">#<span>EarthQuake</span></a> <a href="https://mastodon.cloud/tags/quake" class="mention hashtag status-link" rel="noopener" target="_blank">#<span>Quake</span></a> <a href="https://mastodon.cloud/tags/california" class="mention hashtag status-link" rel="noopener" target="_blank">#<span>California</span></a></p>`;

        component.text = sample;
        expect(component.processedText).toContain(`<a href="https://www.google.com/maps/place/34°58'4%20N+120°41'6%20W/@34.968,-120.685,10z" class="link-httpswwwgooglecommapsplace3458420N12041620W3496812068510z" title="open link" target="_blank" rel="noopener noreferrer">google.com/maps/place/34°58\'4%</a>`);
    });

    it('should parse combined hashtag, mention and link', () => {
        const hashtag = 'programmers';
        const hashtagUrl = 'https://test.social/tags/programmers';
        const mention = 'sengi_app';
        const mentionUrl = 'https://mastodon.social/@sengi_app';
        const linkUrl = 'mydomain.co/test';
        const sample = `<p>bla1 <a href="${hashtagUrl}" class="mention hashtag" rel="nofollow noopener" target="_blank">#<span>${hashtag}</span></a> bla2 <span class="h-card"><a href="${mentionUrl}" class="u-url mention" rel="nofollow noopener" target="_blank">@<span>${mention}</span></a></span> bla3 <a href="https://${linkUrl}" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="">${linkUrl}</span><span class="invisible"></span></a> bla4</p>`;
        component.text = sample;
        expect(component.processedText).toContain(`<a href="${hashtagUrl}" class="hashtag-programmers" title="#programmers" target="_blank" rel="noopener noreferrer">#programmers</a>`);
        expect(component.processedText).toContain(`<a href="${mentionUrl}" class="account--sengi_app-mastodon-social" title="@sengi_app@mastodon.social" target="_blank" rel="noopener noreferrer">@sengi_app</a>`);
        expect(component.processedText).toContain(`<a href="https://${linkUrl}" class="link-httpsmydomaincotest" title="open link" target="_blank" rel="noopener noreferrer">mydomain.co/test</a>`);
        expect(component.processedText).toContain('bla1');
        expect(component.processedText).toContain('bla2');
        expect(component.processedText).toContain('bla3');
        expect(component.processedText).toContain('bla4');
    });  

    it('should parse link - GNU social in Mastodon', () => {
        const sample = `bla1 <a href="https://www.lemonde.fr/planete.html?xtor=RSS-3208" rel="nofollow noopener" class="" target="_blank">https://social.bitcast.info/url/819438</a>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href="https://www.lemonde.fr/planete.html?xtor=RSS-3208" class="link-httpswwwlemondefrplanetehtmlxtorRSS3208" title="open link" target="_blank" rel="noopener noreferrer">https://social.bitcast.info/url/819438</a>');
        expect(component.processedText).toContain('bla1');
    });

    it('should parse mention - Pleroma in Mastodon', () => {
        const sample = `<div>bla1 <br> @<a href="https://instance.club/user/1" class="h-card mention status-link" rel="noopener" target="_blank" title="https://instance.club/user/1">user</a>&nbsp;</div>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href="https://instance.club/user/1" class="account--user-instance-club" title="@user@instance.club" target="_blank" rel="noopener noreferrer">@user</a>');
        expect(component.processedText).toContain('bla1');     
    });

    it('should parse mention - Pleroma in Mastodon - 2', () => {
        const sample = `<div><span><a class="mention status-link" href="https://pleroma.site/users/kaniini" rel="noopener" target="_blank" title="kaniini@pleroma.site">@<span>kaniini</span></a></span> <span><a class="mention status-link" href="https://mastodon.social/@Gargron" rel="noopener" target="_blank" title="Gargron@mastodon.social">@<span>Gargron</span></a></span> bla1?</div>`;

        component.text = sample;
        expect(component.processedText).toContain('<div><span><a href="https://pleroma.site/users/kaniini" class="account--kaniini-pleroma-site" title="@kaniini@pleroma.site" target="_blank" rel="noopener noreferrer">@kaniini</a> <span><a href="https://mastodon.social/@Gargron" class="account--Gargron-mastodon-social" title="@Gargron@mastodon.social" target="_blank" rel="noopener noreferrer">@Gargron</a> bla1?</div>');
    });       

    it('should parse mention - Friendica in Mastodon', () => {
        const sample = `@<span class=""><a href="https://m.s/me" class="u-url mention" rel="nofollow noopener" target="_blank"><span class="mention">me</span></a></span> Blablabla.`;

        component.text = sample;
        expect(component.processedText).toContain('<span class=""><a href="https://m.s/me" class="account--me-m-s" title="@me@m.s" target="_blank" rel="noopener noreferrer">@me</a></span> Blablabla.');
    });

    it('should parse mention - Misskey in Mastodon', () => {
        const sample = `<p><a href="https://mastodon.social/users/sengi_app" class="mention" rel="nofollow noopener" target="_blank">@sengi_app@mastodon.social</a><span> Blabla</span></p>`;

        component.text = sample;
        expect(component.processedText).toContain('<p><a href="https://mastodon.social/users/sengi_app" class="account--sengi_app-mastodon-social-mastodon-social" title="@sengi_app@mastodon.social@mastodon.social" target="_blank" rel="noopener noreferrer">@sengi_app@mastodon.social</a><span> Blabla</span></p>'); //FIXME: dont let domain appear in name
    });

    it('should parse mention - Misskey in Pleroma', () => {
        const sample = `<p><a href="https://domain.xyz/@sengi" class="u-url mention">@sengi@domain.xyz</a><span> </span><a href="https://domain.eu/@sengi" class="u-url mention">@sengi@domain.eu</a><span> bla bla<br/>bla bla bla</span></p>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href="https://domain.xyz/@sengi" class="account--sengi-domain-xyz" title="@sengi@domain.xyz" target="_blank" rel="noopener noreferrer">@sengi</a><span>');
        expect(component.processedText).toContain('<a href="https://domain.eu/@sengi" class="account--sengi-domain-eu" title="@sengi@domain.eu" target="_blank" rel="noopener noreferrer">@sengi</a>');
        expect(component.processedText).toContain('<span> bla bla<br/>bla bla bla</span>');
    });

    it('should parse mention - Misskey in Mastodon - 2', () => {
        const sample = `<p><span>Since </span><a href="https://mastodon.technology/@test" class="u-url mention" rel="nofollow noopener noreferrer" target="_blank">@test@mastodon.technology</a><span> mentioned </span></p>`;

        component.text = sample;
        expect(component.processedText).toContain('<a href="https://mastodon.technology/@test" class="account--test-mastodon-technology" title="@test@mastodon.technology" target="_blank" rel="noopener noreferrer">@test</a>');
    });

    it('should parse mention - Zap in Mastodon', () => {
        const sample = `test @<span class="h-card"><a class="u-url mention" href="https://mastodon.social/@test" rel="nofollow noopener noreferrer" target="_blank">test</a></span> bla"`;

        component.text = sample;
        expect(component.processedText).toContain('test <span class="h-card"><a href="https://mastodon.social/@test" class="account--test-mastodon-social" title="@test@mastodon.social" target="_blank" rel="noopener noreferrer">@test</a></span>');
    });

    it('should parse hashtag - Pleroma', () => {
        const sample = `<p>Bla <a href="https://ubuntu.social/tags/kubecon" rel="tag">#<span>KubeCon</span></a> Bla</p>`;

        component.text = sample;
        expect(component.processedText).toContain('<p>Bla  <a href="https://ubuntu.social/tags/kubecon" class="hashtag-KubeCon" title="#KubeCon" target="_blank" rel="noopener noreferrer">#KubeCon</a> Bla</p>'); 
    });

    it('should parse link - Pleroma', () => {
        const sample = `<p>Bla <a href="https://cloudblogs.microsoft.com/opensource/2019/05/21/service-mesh-interface-smi-release/"><span>https://</span><span>cloudblogs.microsoft.com/opens</span><span>ource/2019/05/21/service-mesh-interface-smi-release/</span></a></p>`;

        component.text = sample;
        expect(component.processedText).toContain('<p>Bla <a href="https://cloudblogs.microsoft.com/opensource/2019/05/21/service-mesh-interface-smi-release/" class="link-httpscloudblogsmicrosoftcomopensource20190521servicemeshinterfacesmirelease" title="open link" target="_blank" rel="noopener noreferrer">cloudblogs.microsoft.com/opens</a></p>'); 
    });

    it('should parse link 2 - Pleroma', () => {
        const sample = `Bla<br /><br /><a href="https://link/">https://link/</a>`;

        component.text = sample;
        expect(component.processedText).toContain('Bla<br /><br /><a href="https://link/" class="link-httpslink" title="open link" target="_blank" rel="noopener noreferrer">https://link/</a>'); 
    });

    it('should sanitize link', () => {
        const sample = `https://domain.fr/public.php?op=rss&amp;id=-2&amp;key=60c63a21c2928546b4485017876fe850c6ebcebd#tag:domain.fr,2020-05-26:/49902061`;

        let result = (<any>component).sanitizeLink(sample);
        expect(result).toBe('https://domain.fr/public.php?op=rss&id=-2&key=60c63a21c2928546b4485017876fe850c6ebcebd#tag:domain.fr,2020-05-26:/49902061'); 
    });
});