import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledStatusesComponent } from './scheduled-statuses.component';

xdescribe('ScheduledStatusesComponent', () => {
  let component: ScheduledStatusesComponent;
  let fixture: ComponentFixture<ScheduledStatusesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledStatusesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledStatusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
