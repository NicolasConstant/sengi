import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { HttpClientModule } from '@angular/common/http';

import { CreateStatusComponent } from './create-status.component';
import { WaitingAnimationComponent } from '../waiting-animation/waiting-animation.component';
import { MediaComponent } from './media/media.component';
import { RegisteredAppsState } from '../../states/registered-apps.state';
import { AccountsState } from '../../states/accounts.state';
import { StreamsState } from '../../states/streams.state';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { MastodonService } from '../../services/mastodon.service';
import { restoreView } from '@angular/core/src/render3';

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
                NgxsModule.forRoot([
                    RegisteredAppsState,
                    AccountsState,
                    StreamsState
                  ]),                  
           ],
           providers: [NavigationService, NotificationService, MastodonService], 
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
        console.warn(result); 
        expect(result.length).toBe(3);
        expect(result[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam lobortis dui vitae libero ultricies, eget lobortis velit finibus. Curabitur et finibus diam, quis facilisis nisi. In dapibus, orci vel posuere consectetur, nunc nisl interdum quam, a commodo neque arcu vitae neque. Vivamus porta, diam nec sollicitudin interdum, lectus diam pulvinar nulla, in ornare tellus odio et turpis. Nam et ipsum id mauris suscipit tincidunt. Class aptent taciti sociosqu ad litora torquent per conubia (...)');
        expect(result[1]).toBe('nostra, per inceptos himenaeos. Donec nec ullamcorper mauris. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc venenatis ipsum et felis ultrices porta. Sed justo nisl, sollicitudin sed nisi id, malesuada posuere lacus. Morbi condimentum tincidunt porta. Nunc vestibulum tellus sit amet quam sagittis, ac sollicitudin mi ullamcorper. Nunc eget sapien blandit purus convallis pellentesque. Fusce feugiat eu lacus vitae mattis. Vestibulum rhoncus nulla eu consectetur mollis. (...)');
        expect(result[2]).toBe('Phasellus venenatis at ligula eu feugiat. Donec ultricies ante fringilla, aliquet purus sit amet, rutrum justo. Maecenas sit amet magna laoreet, fermentum lectus nec, pretium ligula. Aenean gravida dolor vitae nibh sodales, vitae consectetur nibh dapibus. Mauris viverra congue ornare. Etiam quis mi fringilla lacus.');
        expect(result[0].length).toBeLessThanOrEqual(500);
        expect(result[1].length).toBeLessThanOrEqual(500);
        expect(result[2].length).toBeLessThanOrEqual(500);
    });
});