import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsTutorialComponent } from './labels-tutorial.component';

xdescribe('LabelsTutorialComponent', () => {
  let component: LabelsTutorialComponent;
  let fixture: ComponentFixture<LabelsTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelsTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelsTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
