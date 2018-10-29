import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingAnimationComponent } from './waiting-animation.component';

xdescribe('WaitingAnimationComponent', () => {
  let component: WaitingAnimationComponent;
  let fixture: ComponentFixture<WaitingAnimationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitingAnimationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitingAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
