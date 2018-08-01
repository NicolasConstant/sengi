import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamsSelectionFooterComponent } from './streams-selection-footer.component';

describe('StreamsSelectionFooterComponent', () => {
  let component: StreamsSelectionFooterComponent;
  let fixture: ComponentFixture<StreamsSelectionFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamsSelectionFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamsSelectionFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
