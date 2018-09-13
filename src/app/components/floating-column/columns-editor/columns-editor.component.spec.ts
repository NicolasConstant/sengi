import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsEditorComponent } from './columns-editor.component';

describe('ColumnsEditorComponent', () => {
  let component: ColumnsEditorComponent;
  let fixture: ComponentFixture<ColumnsEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnsEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
