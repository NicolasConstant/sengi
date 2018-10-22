import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamOverlayComponent } from './stream-overlay.component';

describe('StreamOverlayComponent', () => {
  let component: StreamOverlayComponent;
  let fixture: ComponentFixture<StreamOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
