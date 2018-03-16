import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TootComponent } from './toot.component';

describe('TootComponent', () => {
  let component: TootComponent;
  let fixture: ComponentFixture<TootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
