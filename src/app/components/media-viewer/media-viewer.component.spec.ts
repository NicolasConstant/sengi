import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaViewerComponent } from './media-viewer.component';

xdescribe('MediaViewerComponent', () => {
  let component: MediaViewerComponent;
  let fixture: ComponentFixture<MediaViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
