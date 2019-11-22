import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamNotificationsComponent } from './stream-notifications.component';

xdescribe('StreamNotificationsComponent', () => {
  let component: StreamNotificationsComponent;
  let fixture: ComponentFixture<StreamNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
