import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMessagesComponent } from './direct-messages.component';

xdescribe('DirectMessagesComponent', () => {
  let component: DirectMessagesComponent;
  let fixture: ComponentFixture<DirectMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
