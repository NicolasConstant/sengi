import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ContextMenuModule } from 'ngx-contextmenu';

import { CreateStatusComponent } from './create-status.component';
import { WaitingAnimationComponent } from '../waiting-animation/waiting-animation.component';
import { MediaComponent } from './media/media.component';
import { RegisteredAppsState } from '../../states/registered-apps.state';
import { AccountsState } from '../../states/accounts.state';
import { StreamsState } from '../../states/streams.state';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { MastodonService } from '../../services/mastodon.service';
import { AuthService } from '../../services/auth.service';


describe('CreateStatusComponent', () => {
    let component: CreateStatusComponent;
    let fixture: ComponentFixture<CreateStatusComponent>;

    beforeEach(async(() => {
        //this.component = new CreateStatusComponent(null, null, null, null, null);

        TestBed.configureTestingModule({
            declarations: [CreateStatusComponent, WaitingAnimationComponent, MediaComponent],
            imports: [
                FormsModule,
                HttpClientModule,
                ContextMenuModule.forRoot(),
                NgxsModule.forRoot([
                    RegisteredAppsState,
                    AccountsState,
                    StreamsState
                  ]),                  
           ],
           providers: [NavigationService, NotificationService, MastodonService, AuthService], 
           schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not count emoji as multiple chars', () => {
        const status = '😃 😍 👌 👇 😱 😶 status with 😱 😶 emojis 😏 👍 ';
        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(461);
    });

    it('should not count emoji in CW as multiple chars', () => {
        const status = 'test';
        (<any>component).title = '🙂 test';
        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(490);
    });

    it('should not count domain chars in username', () => {
        const status = 'dsqdqs @NicolasConstant@mastodon.partipirate.org dsqdqsdqsd';
        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(466);
    });

    it('should not count https link more than the minimum', () => {
        const status = "https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/";
        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(477);
    });

    it('should not count http link more than the minimum', () => {
        const status = "http://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/";
        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(477);
    });
    
    it('should not count links more than the minimum', () => {
        const status = "http://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/ http://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/ http://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/";
        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(429);
    });

    it('should count correctly complex status', () => {
        const status = 'dsqdqs @NicolasConstant@mastodon.partipirate.org dsqdqs👇😱 😶 status https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/ #Pleroma with 😱 😶 emojis 😏 👍 #Mastodon @ddqsdqs @dsqdsq@dqsdsqqdsq';
        (<any>component).title = '🙂 test';
        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(373);
    });    

    it('should not parse small status', () => {
        const status = 'this is a cool status';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(1);
        expect(result[0]).toBe(status);
    });

    it('should parse small status in two', () => {
        const status = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar.';
        (<any>component).maxCharLength = 66;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(2);
        expect(result[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit. (...)');
        expect(result[1]).toBe('Mauris sed ante id dolor vulputate pulvinar.');
    });

    it('should parse medium status in two', () => {
        const status = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar sit amet a nisl. Duis sagittis nisl sit amet est rhoncus rutrum. Duis aliquet eget erat nec molestie. Fusce bibendum consectetur rhoncus. Aenean vel neque ac diam hendrerit interdum id a nisl. Aenean leo ante, luctus eget erat at, interdum tincidunt turpis. Donec non efficitur magna. Nam placerat convallis tincidunt. Etiam ac scelerisque velit, at vestibulum turpis. In hac habitasse platea dictumst. Cras ut mauris vitae est finibus faucibus vitae sed arcu. Praesent sem nisl, accumsan sed fringilla at, viverra nec felis. Morbi sit amet diam in quam mollis aliquet. Integer finibus nunc nunc. Suspendisse quam nisl, condimentum vitae lacus sed, lacinia dictum tellus. Mauris vitae odio ac leo bibendum facilisis.';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(2);
        expect(result[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar sit amet a nisl. Duis sagittis nisl sit amet est rhoncus rutrum. Duis aliquet eget erat nec molestie. Fusce bibendum consectetur rhoncus. Aenean vel neque ac diam hendrerit interdum id a nisl. Aenean leo ante, luctus eget erat at, interdum tincidunt turpis. Donec non efficitur magna. Nam placerat convallis tincidunt. Etiam ac scelerisque velit, at vestibulum turpis. In hac habitasse platea (...)');
        expect(result[1]).toBe('dictumst. Cras ut mauris vitae est finibus faucibus vitae sed arcu. Praesent sem nisl, accumsan sed fringilla at, viverra nec felis. Morbi sit amet diam in quam mollis aliquet. Integer finibus nunc nunc. Suspendisse quam nisl, condimentum vitae lacus sed, lacinia dictum tellus. Mauris vitae odio ac leo bibendum facilisis.');
        expect(result[0].length).toBeLessThanOrEqual(500);
        expect(result[1].length).toBeLessThanOrEqual(500);
    });

    it('should not parse exact status in two', () => {
        const status = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar sit amet a nisl. Duis sagittis nisl sit amet est rhoncus rutrum. Duis aliquet eget erat nec molestie. Fusce bibendum consectetur rhoncus. Aenean vel neque ac diam hendrerit interdum id a nisl. Aenean leo ante, luctus eget erat at, interdum tincidunt turpis. Donec non efficitur magna. Nam placerat convallis tincidunt. Etiam ac scelerisque velit, at vestibulum turpis. In hac habitasse platea dictum';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(1);
    });

    it('should parse big status in three', () => {
        const status = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam lobortis dui vitae libero ultricies, eget lobortis velit finibus. Curabitur et finibus diam, quis facilisis nisi. In dapibus, orci vel posuere consectetur, nunc nisl interdum quam, a commodo neque arcu vitae neque. Vivamus porta, diam nec sollicitudin interdum, lectus diam pulvinar nulla, in ornare tellus odio et turpis. Nam et ipsum id mauris suscipit tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec nec ullamcorper mauris. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc venenatis ipsum et felis ultrices porta. Sed justo nisl, sollicitudin sed nisi id, malesuada posuere lacus. Morbi condimentum tincidunt porta. Nunc vestibulum tellus sit amet quam sagittis, ac sollicitudin mi ullamcorper. Nunc eget sapien blandit purus convallis pellentesque. Fusce feugiat eu lacus vitae mattis. Vestibulum rhoncus nulla eu consectetur mollis. Phasellus venenatis at ligula eu feugiat. Donec ultricies ante fringilla, aliquet purus sit amet, rutrum justo. Maecenas sit amet magna laoreet, fermentum lectus nec, pretium ligula. Aenean gravida dolor vitae nibh sodales, vitae consectetur nibh dapibus. Mauris viverra congue ornare. Etiam quis mi fringilla lacus.';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(3);
        expect(result[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam lobortis dui vitae libero ultricies, eget lobortis velit finibus. Curabitur et finibus diam, quis facilisis nisi. In dapibus, orci vel posuere consectetur, nunc nisl interdum quam, a commodo neque arcu vitae neque. Vivamus porta, diam nec sollicitudin interdum, lectus diam pulvinar nulla, in ornare tellus odio et turpis. Nam et ipsum id mauris suscipit tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia (...)');
        expect(result[1]).toBe('nostra, per inceptos himenaeos. Donec nec ullamcorper mauris. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc venenatis ipsum et felis ultrices porta. Sed justo nisl, sollicitudin sed nisi id, malesuada posuere lacus. Morbi condimentum tincidunt porta. Nunc vestibulum tellus sit amet quam sagittis, ac sollicitudin mi ullamcorper. Nunc eget sapien blandit purus convallis pellentesque. Fusce feugiat eu lacus vitae mattis. Vestibulum rhoncus nulla eu consectetur mollis. (...)');
        expect(result[2]).toBe('Phasellus venenatis at ligula eu feugiat. Donec ultricies ante fringilla, aliquet purus sit amet, rutrum justo. Maecenas sit amet magna laoreet, fermentum lectus nec, pretium ligula. Aenean gravida dolor vitae nibh sodales, vitae consectetur nibh dapibus. Mauris viverra congue ornare. Etiam quis mi fringilla lacus.');
        expect(result[0].length).toBeLessThanOrEqual(500);
        expect(result[1].length).toBeLessThanOrEqual(500);
        expect(result[2].length).toBeLessThanOrEqual(500);
    });

    it('should not count domain length when replying', () => {
        const status = '@Lorem@ipsum.com ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar sit amet a nisl. Duis sagittis nisl sit amet est rhoncus rutrum. Duis aliquet eget erat nec molestie. Fusce bibendum consectetur rhoncus. Aenean vel neque ac diam hendrerit interdum id a nisl. Aenean leo ante, luctus eget erat at, interdum tincidunt turpis. Donec non efficitur magna. Nam placerat convallis tincidunt. Etiam ac scelerisque velit, at vestibulum turpis. In hac habitasse platea dictu';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(1);
    });

    it('should not count domain length when replying', () => {
        const status = '@Lorem@ipsum.com @1orem@ipsum.com ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar sit amet a nisl. Duis sagittis nisl sit amet est rhoncus rutrum. Duis aliquet eget erat nec molestie. Fusce bibendum consectetur rhoncus. Aenean vel neque ac diam hendrerit interdum id a nisl. Aenean leo ante, luctus eget erat at, interdum tincidunt turpis. Donec non efficitur magna. Nam placerat convallis tincidunt. Etiam ac scelerisque velit, at vestibulum turpis. In hac habitasse plate';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(1);
    });

    it('should count URL correctly', () => {
        const newLine = String.fromCharCode(13, 10);
        const status = `qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd https://google.com/testqsdqsdqsdqsdqsdqsdqsdqdqsdqsdqsdqsdqs dsqd qsd qsd dsqdqs dqs dqsd qsd qsd qsd qsd qsd qs dqsdsq qsd qsd qs dsqds qqs d dqs dqs dqs dqqsd qsd qsd qsd sqd qsd qsd sqd qds dsqd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s`;

        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(0);
    });

    it('should count URL correctly - new lines', () => {
        const status = `qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd\nhttps://google.com/testqsdqsdqsdqsdqsdqsdqsdqdqsdqsdqsdqsdqs\ndsqd qsd qsd dsqdqs dqs dqsd qsd qsd qsd qsd qsd qs dqsdsq qsd qsd qs dsqds qqs d dqs dqs dqs dqqsd qsd qsd qsd sqd qsd qsd sqd qds dsqd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s`;

        (<any>component).maxCharLength = 500;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(0);
    });

    it('should count URL correctly - dual post', () => {
        const status = `qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd https://google.com/testqsdqsdqsdqsdqsdqsdqsdqdqsdqsdqsdqsdqs dsqd qsd qsd dsqdqs dqs dqsd qsd qsd qsd qsd qsd qs dqsdsq qsd qsd qs dsqds qqs d dqs dqs dqs dqqsd qsd qsd qsd sqd qsd qsd sqd qds dsqd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd  qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsdd dqsd qs s`;

        (<any>component).maxCharLength = 512;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(0);
        expect((<any>component).postCounts).toBe(2);
    });

    it('should count URL correctly - triple post', () => {
        const status = `qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd https://google.com/testqsdqsdqsdqsdqsdqsdqsdqdqsdqsdqsdqsdqs dsqd qsd qsd dsqdqs dqs dqsd qsd qsd qsd qsd qsd qs dqsdsq qsd qsd qs dsqds qqs d dqs dqs dqs dqqsd qsd qsd qsd sqd qsd qsd sqd qds dsqd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd qsd qsd qs dqsd  qsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsd qsd qsddq sqd qsd qsdqs dqsd qsd qsd qsd qsd qsd qsd dsqd qsd qsd dsqdqs fqd dsq sq dsq qsd q qsd qsd qs dqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsdd dqsd qs s dsqs sd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsdd dqsd qs s dsqs sd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsdd dqsd qs s dsqs sd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsqs dqs qsd qsd qss sq ss s dqsd qsd sqd qsqsd qsd qsdd dqsd qs s dsqs sd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd qs qsd qsd qsd qsd sqd qsd qsd sqd qsd qsd qsd qsd qsd qsd qsd qsd qsd qsd sd`;

        (<any>component).maxCharLength = 512;
        (<any>component).countStatusChar(status);
        expect((<any>component).charCountLeft).toBe(0);
        expect((<any>component).postCounts).toBe(3);
    });

    it('should add alias in multiposting replies', () => {
        const status = '@Lorem@ipsum.com ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar sit amet a nisl. Duis sagittis nisl sit amet est rhoncus rutrum. Duis aliquet eget erat nec molestie. Fusce bibendum consectetur rhoncus. Aenean vel neque ac diam hendrerit interdum id a nisl. Aenean leo ante, luctus eget erat at, interdum tincidunt turpis. Donec non efficitur magna. Nam placerat convallis tincidunt. Etiam ac scelerisque velit, at vestibulum turpis. In hac habitasse platea dictu0';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(2);
        expect(result[0].length).toBeLessThanOrEqual(510);
        expect(result[1].length).toBeLessThanOrEqual(510);
        expect(result[0]).toContain('@Lorem@ipsum.com ');
        expect(result[1]).toContain('@Lorem@ipsum.com ');
    });

    it('should add alias in multiposting replies', () => {
        const status = '@Lorem@ipsum.com @48756@987586.ipsum.com ipsum dolor sit amet, consectetur adipiscing elit. Mauris sed ante id dolor vulputate pulvinar sit amet a nisl. Duis sagittis nisl sit amet est rhoncus rutrum. Duis aliquet eget erat nec molestie. Fusce bibendum consectetur rhoncus. Aenean vel neque ac diam hendrerit interdum id a nisl. Aenean leo ante, luctus eget erat at, interdum tincidunt turpis. Donec non efficitur magna. Nam placerat convallis tincidunt. Etiam ac scelerisque velit, at vestibulum turpis. In hac habitasse platea dictu0';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(2);
        expect(result[0].length).toBeLessThanOrEqual(527);
        expect(result[1].length).toBeLessThanOrEqual(527);
        expect(result[0]).toContain('@Lorem@ipsum.com ');
        expect(result[1]).toContain('@Lorem@ipsum.com ');
    });

    it('should parse long link properly for multiposting', () => {
        const status = 'dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd qsd sqd qsd qsd dsqd qsd qsd sqd qsd sqd dsq http://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/';
        (<any>component).maxCharLength = 500;
        const result = <string[]>(<any>component).parseStatus(status);
        expect(result.length).toBe(2);
        expect(result[0].length).toBeLessThanOrEqual(527);
        expect(result[1].length).toBeLessThanOrEqual(527);      
        expect(result[1]).toBe('http://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/');      
    });

    it('should transform external mentions properly - mastodon', () => {
        let mastodonMention = '<p>test <span class="h-card"><a href="https://mastodon.social/@sengi_app" class="u-url mention">@<span>sengi_app</span></a></span> qsdqds qsd qsd qsd q <span class="h-card"><a href="https://mastodon.social/@test" class="u-url mention">@<span>test</span></a></span> <span class="h-card"><a href="https://mastodon.social/@no" class="u-url">@<span>no</span></a></span></p>';
     
        const result = <string>(<any>component).transformHtmlRepliesToReplies(mastodonMention);
        expect(result).toBe('<p>test @sengi_app@mastodon.social qsdqds qsd qsd qsd q @test@mastodon.social <span class="h-card"><a href="https://mastodon.social/@no" class="u-url">@<span>no</span></a></span></p>');       
    });

    it('should transform external mentions properly - mastodon 2', () => {
        let mastodonMention = '<p>test <span class="h-card"><a href="https://pleroma.site/users/sengi_app" class="u-url mention">@<span>sengi_app</span></a></span> qsdqds qsd qsd qsd q <span class="h-card"><a href="https://pleroma.site/users/test" class="u-url mention">@<span>test</span></a></span> <span class="h-card"><a href="https://pleroma.site/users/no" class="u-url">@<span>no</span></a></span></p>';
     
        const result = <string>(<any>component).transformHtmlRepliesToReplies(mastodonMention);
        expect(result).toBe('<p>test @sengi_app@pleroma.site qsdqds qsd qsd qsd q @test@pleroma.site <span class="h-card"><a href="https://pleroma.site/users/no" class="u-url">@<span>no</span></a></span></p>');       
    });

    it('should transform external mentions properly - pleroma', () => {
        let pleromaMention = '<p>test <span class="h-card"><a data-user="50504" class="u-url mention" href="https://mastodon.social/@sengi_app" rel="ugc">@<span>sengi_app</span></a></span> qsdqds qsd qsd qsd q <span class="h-card"><a data-user="50504" class="u-url mention" href="https://mastodon.social/@test" rel="ugc">@<span>test</span></a></span> <span class="h-card"><a href="https://mastodon.social/@no" class="u-url">@<span>no</span></a></span></p>';
     
        const result = <string>(<any>component).transformHtmlRepliesToReplies(pleromaMention);
        expect(result).toBe('<p>test @sengi_app@mastodon.social qsdqds qsd qsd qsd q @test@mastodon.social <span class="h-card"><a href="https://mastodon.social/@no" class="u-url">@<span>no</span></a></span></p>');       
    });

    it('should transform external mentions properly - pleroma 2', () => {
        let pleromaMention = '<p>test <span class="h-card"><a data-user="50504" class="u-url mention" href="https://pleroma.site/users/sengi_app" rel="ugc">@<span>sengi_app</span></a></span> qsdqds qsd qsd qsd q <span class="h-card"><a data-user="50504" class="u-url mention" href="https://pleroma.site/users/test" rel="ugc">@<span>test</span></a></span> <span class="h-card"><a href="https://pleroma.site/users/no" class="u-url">@<span>no</span></a></span></p>';
     
        const result = <string>(<any>component).transformHtmlRepliesToReplies(pleromaMention);
        expect(result).toBe('<p>test @sengi_app@pleroma.site qsdqds qsd qsd qsd q @test@pleroma.site <span class="h-card"><a href="https://pleroma.site/users/no" class="u-url">@<span>no</span></a></span></p>');       
    });

    it('should autocomplete - at the end', () => {
        let text = 'data @sengi';
        let pattern = '@sengi';
        let autosuggest = '@sengi@mastodon.social';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe('data @sengi@mastodon.social ');
    });

    it('should autocomplete - at the start', () => {
        let text = '@sengi data';
        let pattern = '@sengi';
        let autosuggest = '@sengi@mastodon.social';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe('@sengi@mastodon.social data');
    });

    it('should autocomplete - at the middle', () => {
        let text = 'data @sengi data';
        let pattern = '@sengi';
        let autosuggest = '@sengi@mastodon.social';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe('data @sengi@mastodon.social data');
    });

    it('should autocomplete - duplicate', () => {
        let text = 'data @sengi @sengi2 data';
        let pattern = '@sengi';
        let autosuggest = '@sengi@mastodon.social';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe('data @sengi@mastodon.social @sengi2 data');
    });

    it('should autocomplete - duplicate 2', () => {
        let text = 'data @sengi2 @sengi data';
        let pattern = '@sengi';
        let autosuggest = '@sengi@mastodon.social';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe('data @sengi2 @sengi@mastodon.social data');
    });

    it('should autocomplete - new lines', () => {
        const newLine = String.fromCharCode(13, 10);
        let text = `@sengi${newLine}${newLine}data`;
        let pattern = '@sengi';
        let autosuggest = '@sengi@mastodon.social';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe(`@sengi@mastodon.social${newLine}${newLine}data`);
    });

    it('should autocomplete - new lines 2', () => {
        const newLine = String.fromCharCode(13, 10);
        let text = `@nicolasconstant\n\ndata`;
        let pattern = '@nicolasconstant';
        let autosuggest = '@nicolasconstant@social.nicolas-constant.com';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe(`@nicolasconstant@social.nicolas-constant.com${newLine}${newLine}data`);
    });

    it('should autocomplete - complex', () => {
        const newLine = String.fromCharCode(13, 10);
        let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ullamcorper nulla eu metus euismod, non lobortis${newLine}quam congue. @sengi Ut hendrerit, nulla vel feugiat lobortis, diam ligula congue lacus, sed facilisis nisl dui at mauris.${newLine}Cras non hendrerit tellus. Donec eleifend metus quis nibh commodo${newLine}${newLine}data`;
        let pattern = '@sengi';
        let autosuggest = '@sengi@mastodon.social';

        const result = <string>(<any>component).replacePatternWithAutosuggest(text, pattern, autosuggest);
        expect(result).toBe(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ullamcorper nulla eu metus euismod, non lobortis${newLine}quam congue. @sengi@mastodon.social Ut hendrerit, nulla vel feugiat lobortis, diam ligula congue lacus, sed facilisis nisl dui at mauris.${newLine}Cras non hendrerit tellus. Donec eleifend metus quis nibh commodo${newLine}${newLine}data`);
    });
});