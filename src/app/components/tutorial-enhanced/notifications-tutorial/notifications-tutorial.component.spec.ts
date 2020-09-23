import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsTutorialComponent } from './notifications-tutorial.component';

xdescribe('NotificationsTutorialComponent', () => {
  let component: NotificationsTutorialComponent;
  let fixture: ComponentFixture<NotificationsTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
