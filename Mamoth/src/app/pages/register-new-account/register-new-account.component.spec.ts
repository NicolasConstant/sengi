import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNewAccountComponent } from './register-new-account.component';

describe('RegisterNewAccountComponent', () => {
  let component: RegisterNewAccountComponent;
  let fixture: ComponentFixture<RegisterNewAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterNewAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterNewAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
