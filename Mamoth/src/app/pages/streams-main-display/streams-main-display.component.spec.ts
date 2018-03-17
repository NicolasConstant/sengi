import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamsMainDisplayComponent } from './streams-main-display.component';

describe('StreamsMainDisplayComponent', () => {
  let component: StreamsMainDisplayComponent;
  let fixture: ComponentFixture<StreamsMainDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamsMainDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamsMainDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
