import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MentionsComponent } from './mentions.component';

xdescribe('MentionsComponent', () => {
  let component: MentionsComponent;
  let fixture: ComponentFixture<MentionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MentionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MentionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
