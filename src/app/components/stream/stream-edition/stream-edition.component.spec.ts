import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamEditionComponent } from './stream-edition.component';

xdescribe('StreamEditionComponent', () => {
  let component: StreamEditionComponent;
  let fixture: ComponentFixture<StreamEditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamEditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
