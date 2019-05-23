import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAccountComponent } from './list-account.component';

describe('ListAccountComponent', () => {
  let component: ListAccountComponent;
  let fixture: ComponentFixture<ListAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
