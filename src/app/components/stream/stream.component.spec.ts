import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamComponent } from './stream.component';

describe('StreamComponent', () => {
  let component: StreamComponent;
  let fixture: ComponentFixture<StreamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
