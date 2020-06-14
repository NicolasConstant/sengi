import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFollowsComponent } from './user-follows.component';

xdescribe('UserFollowsComponent', () => {
  let component: UserFollowsComponent;
  let fixture: ComponentFixture<UserFollowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserFollowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFollowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
