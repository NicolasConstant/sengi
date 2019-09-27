import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PollEntryComponent } from './poll-entry.component';

xdescribe('PollEntryComponent', () => {
  let component: PollEntryComponent;
  let fixture: ComponentFixture<PollEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PollEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
