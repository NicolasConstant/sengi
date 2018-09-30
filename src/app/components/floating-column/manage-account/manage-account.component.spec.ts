import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccountComponent } from './manage-account.component';

describe('ManageAccountComponent', () => {
  let component: ManageAccountComponent;
  let fixture: ComponentFixture<ManageAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
