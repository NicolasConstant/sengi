import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachementsComponent } from './attachements.component';

xdescribe('AttachementsComponent', () => {
  let component: AttachementsComponent;
  let fixture: ComponentFixture<AttachementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
