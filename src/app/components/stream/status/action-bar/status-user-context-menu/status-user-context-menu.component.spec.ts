import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusUserContextMenuComponent } from './status-user-context-menu.component';

xdescribe('StatusUserContextMenuComponent', () => {
  let component: StatusUserContextMenuComponent;
  let fixture: ComponentFixture<StatusUserContextMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusUserContextMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusUserContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
