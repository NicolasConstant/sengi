import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankyouTutorialComponent } from './thankyou-tutorial.component';

describe('ThankyouTutorialComponent', () => {
  let component: ThankyouTutorialComponent;
  let fixture: ComponentFixture<ThankyouTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThankyouTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThankyouTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
