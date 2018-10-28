import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabindedTextComponent } from './databinded-text.component';

xdescribe('DatabindedTextComponent', () => {
  let component: DatabindedTextComponent;
  let fixture: ComponentFixture<DatabindedTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatabindedTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabindedTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
