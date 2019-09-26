import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledStatusComponent } from './scheduled-status.component';

xdescribe('ScheduledStatusComponent', () => {
  let component: ScheduledStatusComponent;
  let fixture: ComponentFixture<ScheduledStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
