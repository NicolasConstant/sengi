import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialEnhancedComponent } from './tutorial-enhanced.component';

xdescribe('TutorialEnhancedComponent', () => {
  let component: TutorialEnhancedComponent;
  let fixture: ComponentFixture<TutorialEnhancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorialEnhancedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorialEnhancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
