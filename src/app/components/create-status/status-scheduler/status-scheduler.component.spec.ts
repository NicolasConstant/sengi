import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusSchedulerComponent } from './status-scheduler.component';

describe('StatusSchedulerComponent', () => {
  let component: StatusSchedulerComponent;
  let fixture: ComponentFixture<StatusSchedulerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusSchedulerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
