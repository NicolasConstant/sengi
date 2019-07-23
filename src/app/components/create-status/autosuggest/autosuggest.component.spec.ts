import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosuggestComponent } from './autosuggest.component';

xdescribe('AutosuggestComponent', () => {
  let component: AutosuggestComponent;
  let fixture: ComponentFixture<AutosuggestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutosuggestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
