import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachementImageComponent } from './attachement-image.component';

xdescribe('AttachementImageComponent', () => {
  let component: AttachementImageComponent;
  let fixture: ComponentFixture<AttachementImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachementImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachementImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
