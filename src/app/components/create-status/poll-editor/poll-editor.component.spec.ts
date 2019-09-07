import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PollEditorComponent } from './poll-editor.component';

describe('PollEditorComponent', () => {
  let component: PollEditorComponent;
  let fixture: ComponentFixture<PollEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PollEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PollEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
