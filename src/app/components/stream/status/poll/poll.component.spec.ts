import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PollComponent } from './poll.component';

xdescribe('PollComponent', () => {
  let component: PollComponent;
  let fixture: ComponentFixture<PollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
