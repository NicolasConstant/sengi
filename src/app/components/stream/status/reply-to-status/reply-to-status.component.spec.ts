import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyToStatusComponent } from './reply-to-status.component';

xdescribe('ReplyToStatusComponent', () => {
  let component: ReplyToStatusComponent;
  let fixture: ComponentFixture<ReplyToStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplyToStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplyToStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
