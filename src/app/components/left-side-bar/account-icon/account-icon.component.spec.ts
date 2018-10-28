import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountIconComponent } from './account-icon.component';

xdescribe('AccountIconComponent', () => {
  let component: AccountIconComponent;
  let fixture: ComponentFixture<AccountIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
