import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamStatusesComponent } from './stream-statuses.component';

xdescribe('StreamStatusesComponent', () => {
  let component: StreamStatusesComponent;
  let fixture: ComponentFixture<StreamStatusesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamStatusesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamStatusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
