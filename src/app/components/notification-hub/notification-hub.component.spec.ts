import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationHubComponent } from './notification-hub.component';

xdescribe('NotificationHubComponent', () => {
  let component: NotificationHubComponent;
  let fixture: ComponentFixture<NotificationHubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationHubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
