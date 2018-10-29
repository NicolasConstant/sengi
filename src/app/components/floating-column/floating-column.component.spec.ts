import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingColumnComponent } from './floating-column.component';

xdescribe('FloatingColumnComponent', () => {
  let component: FloatingColumnComponent;
  let fixture: ComponentFixture<FloatingColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FloatingColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
