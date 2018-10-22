import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HashtagComponent } from './hashtag.component';

describe('HashtagComponent', () => {
  let component: HashtagComponent;
  let fixture: ComponentFixture<HashtagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HashtagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HashtagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
