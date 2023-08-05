import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTranslateComponent } from './status-translate.component';

xdescribe('StatusTranslateComponent', () => {
  let component: StatusTranslateComponent;
  let fixture: ComponentFixture<StatusTranslateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusTranslateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusTranslateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
